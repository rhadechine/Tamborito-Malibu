from django.urls import path

from .views import (
    AdminOrderDetailView,
    AdminOrderListView,
    CartItemDetailView,
    CartItemsView,
    CartView,
    CheckoutView,
    StudentOrderDetailView,
    StudentOrderListView,
)

urlpatterns = [
    path("cart", CartView.as_view(), name="cart"),
    path("cart/items", CartItemsView.as_view(), name="cart-items"),
    path("cart/items/<int:course_id>", CartItemDetailView.as_view(), name="cart-item-detail"),
    path("orders/checkout", CheckoutView.as_view(), name="orders-checkout"),
    path("student/orders", StudentOrderListView.as_view(), name="student-orders"),
    path("student/orders/<int:pk>", StudentOrderDetailView.as_view(), name="student-order-detail"),
    path("admin/orders", AdminOrderListView.as_view(), name="admin-orders"),
    path("admin/orders/<int:pk>", AdminOrderDetailView.as_view(), name="admin-order-detail"),
]
