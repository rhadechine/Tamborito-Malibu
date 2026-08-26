from django.urls import path

from .views import (
    AdminPaymentRefundView,
    PaymentIntentCreateView,
    PaymentIntentDetailView,
    PaymentReturnView,
    PaymentWebhookView,
)

urlpatterns = [
    path("payments/intents", PaymentIntentCreateView.as_view(), name="payment-intents"),
    path("payments/intents/<int:pk>", PaymentIntentDetailView.as_view(), name="payment-intent-detail"),
    path("payments/webhooks/<str:provider>", PaymentWebhookView.as_view(), name="payment-webhook"),
    path("payments/return", PaymentReturnView.as_view(), name="payment-return"),
    path("admin/payments/intents/<int:pk>/refund", AdminPaymentRefundView.as_view(), name="admin-payment-refund"),
]
