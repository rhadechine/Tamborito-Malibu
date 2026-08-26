"""Servicios de Identity — revocación de sesiones (sección 40, "Revocación").

Un access token JWT es autocontenido: no se puede invalidar antes de que
expire (15 min, ver SIMPLE_JWT). Lo que sí se corta de inmediato es la
capacidad de *renovar* la sesión: se mandan a la blacklist todos los refresh
tokens vivos del usuario. Combinado con `is_active` (que `User.save()`
mantiene sincronizado con `status`), una cuenta suspendida deja de poder
autenticarse en el acto — `JWTAuthentication` rechaza el access token
restante porque el usuario ya no está activo.
"""

from rest_framework_simplejwt.token_blacklist.models import (
    BlacklistedToken,
    OutstandingToken,
)


def revoke_refresh_tokens(user):
    """Manda a la blacklist todos los refresh tokens vigentes del usuario."""
    revoked = 0
    for token in OutstandingToken.objects.filter(user=user):
        _blacklisted, created = BlacklistedToken.objects.get_or_create(token=token)
        revoked += int(created)
    return revoked
