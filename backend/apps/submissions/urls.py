from django.urls import path
from .views import (
    SubmissionListCreateView,
    SubmissionDetailView,
    kpi_template,
)

# Default urlpatterns for include("apps.submissions.urls")
urlpatterns = [
    path("",               SubmissionListCreateView.as_view(), name="submission_list"),
    path("<int:pk>/",      SubmissionDetailView.as_view(),     name="submission_detail"),
    path("kpis/template/", kpi_template,                      name="kpi_template"),
]
