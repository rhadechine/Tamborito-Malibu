from rest_framework import serializers

from apps.courses.serializers import CourseListSerializer

from .models import Cart, CartItem, Order, OrderItem


class CartItemSerializer(serializers.ModelSerializer):
    course = CourseListSerializer(read_only=True)

    class Meta:
        model = CartItem
        fields = ["id", "course", "price_snapshot", "added_at"]


class AddCartItemSerializer(serializers.Serializer):
    course_id = serializers.IntegerField()


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ["id", "status", "items", "total", "created_at", "updated_at"]

    def get_total(self, cart):
        return sum((item.price_snapshot for item in cart.items.all()), start=0)


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["id", "course", "title_snapshot", "price_snapshot"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "order_number", "subtotal", "total", "currency", "payment_status",
            "order_status", "payment_method", "transaction_reference", "items",
            "created_at", "updated_at",
        ]
        read_only_fields = [f for f in fields if f not in ("payment_status", "order_status", "transaction_reference")]


class OrderAdminUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ["payment_status", "order_status", "transaction_reference"]
