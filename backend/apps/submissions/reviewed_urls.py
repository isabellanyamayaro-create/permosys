from django.urls import path
from .views import ReviewedSubmissionsView

urlpatterns = [
    path("", ReviewedSubmissionsView.as_view(), name="reviewed_submissions"),
]
