from django.urls import path
from .views import KpiListCreateView, KpiDetailView

urlpatterns = [
    path("",          KpiListCreateView.as_view(), name="kpi_list"),
    path("<int:pk>/", KpiDetailView.as_view(),     name="kpi_detail"),
]
