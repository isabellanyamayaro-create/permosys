from django.urls import path
from .views import PendingApprovalsView, approve_or_reject

urlpatterns = [
    path("",              PendingApprovalsView.as_view(), name="pending_approvals"),
    path("<int:pk>/act/", approve_or_reject,              name="approve_or_reject"),
]
