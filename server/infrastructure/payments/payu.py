"""Cliente PayU Latam — Split 08 (sección 19).

PayU fue seleccionado como pasarela de pago concreta para PSE (la sección 19
dejaba esto pendiente). Se implementa lo que Payments necesita:

- Construir el formulario de WebCheckout al que el frontend redirige al
  comprador (firma MD5 saliente).
- Verificar la firma MD5 de la confirmación (webhook) que PayU envía
  server-to-server, única fuente de verdad de un pago (sección 19,
  "Regla fundamental").
- Solicitar el reembolso de un pago ya aprobado, vía la Transaction API de
  PayU (distinta de WebCheckout).

Referencias:
https://developers.payulatam.com/latam/es/docs/integrations/webcheckout-integration.html
https://developers.payulatam.com/latam/es/docs/integrations/api-integration/payment-reversal.html
"""

import hashlib
import hmac
import json
import logging
import urllib.error
import urllib.request
from decimal import Decimal, InvalidOperation

from django.conf import settings

logger = logging.getLogger("tamborito.payments")

# state_pol -> estado propio (sección 19 / eventos de la sección 28).
STATE_MAP = {
    "4": "approved",
    "5": "expired",
    "6": "rejected",
    "7": "pending",
}


def _format_amount(amount: Decimal) -> str:
    """PayU firma el valor sin ceros decimales sobrantes (p. ej. "10000" o "150.5")."""
    text = str(amount)
    if "." in text:
        text = text.rstrip("0").rstrip(".")
    return text


def _signature(reference_code: str, amount: Decimal, currency: str, state_pol: str | None = None) -> str:
    parts = [settings.PAYU_API_KEY, settings.PAYU_MERCHANT_ID, reference_code, _format_amount(amount), currency]
    if state_pol is not None:
        parts.append(state_pol)
    return _md5(parts)


def _md5(parts: list[str]) -> str:
    return hashlib.md5("~".join(parts).encode()).hexdigest()


def _confirmation_amounts(value) -> list[str]:
    """Formatos con los que PayU pudo haber firmado `value` en la confirmación.

    La confirmación NO usa el mismo formato de valor que WebCheckout. PayU
    documenta que en la firma de la confirmación el valor lleva **un solo
    decimal cuando el segundo decimal es cero** (150.00 -> "150.0",
    150.50 -> "150.5", 150.55 -> "150.55"). Con el formato de WebCheckout
    (`_format_amount`, que quita todos los ceros sobrantes: "150") la firma
    de una confirmación por un importe entero —es decir, prácticamente
    cualquier pago en COP— nunca coincidía y el pago jamás se aprobaba.

    Se aceptan ambas representaciones en vez de apostar a una sola: el
    secreto sigue siendo `PAYU_API_KEY`, así que ampliar el conjunto de
    valores candidatos no debilita la verificación (un atacante que no tiene
    la clave no puede producir ninguno de los dos hashes), pero elimina el
    riesgo de rechazar confirmaciones legítimas.
    """
    try:
        decimal_value = Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        return [str(value)]

    quantized = f"{decimal_value.quantize(Decimal('0.01'))}"
    candidates = [
        quantized.removesuffix("0"),
        _format_amount(decimal_value),
        quantized,
    ]
    return list(dict.fromkeys(candidates))


def build_checkout_payload(intent) -> dict:
    """Campos del formulario WebCheckout al que el frontend hace POST/redirect."""
    return {
        "action_url": settings.PAYU_CHECKOUT_URL,
        "fields": {
            "merchantId": settings.PAYU_MERCHANT_ID,
            "accountId": settings.PAYU_ACCOUNT_ID,
            "description": f"Tamborito-Malibu #{intent.reference_code}",
            "referenceCode": intent.reference_code,
            "amount": _format_amount(intent.amount),
            "currency": intent.currency,
            "signature": _signature(intent.reference_code, intent.amount, intent.currency),
            "test": "1" if settings.PAYU_TEST_MODE else "0",
            "responseUrl": settings.PAYU_RESPONSE_URL,
            "confirmationUrl": settings.PAYU_CONFIRMATION_URL,
        },
    }


def verify_webhook_signature(data: dict) -> bool:
    """Valida la firma MD5 de una confirmación server-to-server de PayU."""
    if not settings.PAYU_API_KEY or not settings.PAYU_MERCHANT_ID:
        # Sin la clave secreta cualquiera podría reproducir la firma: se
        # rechaza en vez de aceptar a ciegas en un despliegue mal configurado.
        logger.error("payu_signature_check_skipped_missing_credentials")
        return False

    received = str(data.get("sign") or "").strip().lower()
    if not received:
        return False

    reference_code = str(data.get("reference_sale", ""))
    currency = str(data.get("currency", ""))
    state_pol = str(data.get("state_pol", ""))

    for amount_text in _confirmation_amounts(data.get("value", "0")):
        expected = _md5(
            [
                settings.PAYU_API_KEY,
                settings.PAYU_MERCHANT_ID,
                reference_code,
                amount_text,
                currency,
                state_pol,
            ]
        )
        # compare_digest: comparación en tiempo constante.
        if hmac.compare_digest(expected, received):
            return True

    logger.warning("payu_signature_mismatch", extra={"reference_sale": reference_code})
    return False


class PayURefundError(Exception):
    """La Transaction API de PayU no pudo procesar el reembolso, o no respondió."""


def request_refund(payu_order_id: str, parent_transaction_id: str) -> dict:
    """SUBMIT_TRANSACTION / type=REFUND contra la Transaction API de PayU.

    `payu_order_id` es el `reference_pol` que PayU incluyó en la confirmación
    original (queda guardado en `PaymentEvent.payload_json`); no es lo mismo
    que `PaymentIntent.reference_code` (el nuestro).
    """
    body = {
        "test": settings.PAYU_TEST_MODE,
        "language": "es",
        "command": "SUBMIT_TRANSACTION",
        "merchant": {"apiLogin": settings.PAYU_API_LOGIN, "apiKey": settings.PAYU_API_KEY},
        "transaction": {
            "order": {"id": payu_order_id},
            "type": "REFUND",
            "parentTransactionId": parent_transaction_id,
        },
    }
    request = urllib.request.Request(
        settings.PAYU_TRANSACTION_API_URL,
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            payload = json.loads(response.read())
    except (urllib.error.URLError, TimeoutError) as exc:
        raise PayURefundError(f"No se pudo contactar a PayU: {exc}") from exc

    transaction_response = payload.get("transactionResponse") or {}
    state = transaction_response.get("state")
    if state != "APPROVED":
        raise PayURefundError(f"PayU no aprobó el reembolso (state={state}).")

    return {"state": state, "transaction_id": transaction_response.get("transactionId", "")}
