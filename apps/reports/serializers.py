"""Serializers de solo documentación — sección 25.

Las vistas de reportes devuelven agregaciones del ORM (diccionarios), no
instancias de modelo. Estos serializers no se usan para serializar: existen
para que el OpenAPI describa la forma exacta de cada reporte, que es lo que
el panel de administración necesita para pintar las métricas.
"""

from rest_framework import serializers


class _MoneyCountSerializer(serializers.Serializer):
    count_paid = serializers.IntegerField(required=False)
    total_paid = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    count_approved = serializers.IntegerField(required=False)
    total_approved = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)


class ReportSummarySerializer(serializers.Serializer):
    orders = _MoneyCountSerializer()
    donations = _MoneyCountSerializer()
    enrollments = serializers.DictField(child=serializers.IntegerField())
    courses = serializers.DictField(child=serializers.IntegerField())


class CourseRevenueSerializer(serializers.Serializer):
    course_id = serializers.IntegerField(allow_null=True)
    course__title = serializers.CharField(allow_null=True)
    course__slug = serializers.CharField(allow_null=True)
    revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    sales = serializers.IntegerField()


class EnrollmentStatSerializer(serializers.Serializer):
    course_id = serializers.IntegerField()
    course__title = serializers.CharField()
    total = serializers.IntegerField()
    completed = serializers.IntegerField()


class DonationStatSerializer(serializers.Serializer):
    organization_target = serializers.CharField()
    total = serializers.DecimalField(max_digits=12, decimal_places=2)
    count = serializers.IntegerField()
