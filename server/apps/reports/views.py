"""Vistas de reportes — sección 25.

Reservadas a `super_admin`: son metricas consolidadas de Fundacion y Museo
y no pueden acotarse por `organization_scope` (una orden puede mezclar
cursos de las dos organizaciones). El administrador general del ecosistema
es quien tiene el panel financiero en el frontend.
"""

from drf_spectacular.utils import extend_schema
from rest_framework import generics
from rest_framework.views import APIView

from apps.commerce.serializers import OrderSerializer
from common.permissions import IsSuperAdmin
from common.responses.envelope import success

from . import selectors
from .serializers import (
    CourseRevenueSerializer,
    DonationStatSerializer,
    EnrollmentStatSerializer,
    ReportSummarySerializer,
)


@extend_schema(responses={200: ReportSummarySerializer})
class ReportSummaryView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        return success(selectors.summary())


class ReportTransactionsView(generics.ListAPIView):
    permission_classes = [IsSuperAdmin]
    serializer_class = OrderSerializer
    queryset = selectors.transactions()


# --- Course revenue / enrollments / donations ------------------------------
#
# Eran `APIView` que devolvían `list(queryset)` completo de una sola vez. Con
# unas pocas docenas de cursos o donantes no se nota, pero es el mismo patrón
# que en cualquier catálogo con crecimiento real termina en una respuesta de
# varios MB. `selectors.*` ya devuelve querysets (`.values().annotate()`), así
# que paginarlos es tan simple como usar `ListAPIView` — el mismo mecanismo
# que ya paginaba `ReportTransactionsView` al lado.


class ReportCourseRevenueView(generics.ListAPIView):
    permission_classes = [IsSuperAdmin]
    serializer_class = CourseRevenueSerializer
    queryset = selectors.course_revenue()


class ReportEnrollmentsView(generics.ListAPIView):
    permission_classes = [IsSuperAdmin]
    serializer_class = EnrollmentStatSerializer
    queryset = selectors.enrollment_stats()


class ReportDonationsView(generics.ListAPIView):
    permission_classes = [IsSuperAdmin]
    serializer_class = DonationStatSerializer
    queryset = selectors.donation_stats()
