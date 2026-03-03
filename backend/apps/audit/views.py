from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from apps.accounts.permissions import IsAdmin
from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogListView(generics.ListAPIView):
    serializer_class   = AuditLogSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        qs = AuditLog.objects.all()
        user_filter = self.request.query_params.get("user")
        action_filter = self.request.query_params.get("action")
        if user_filter:
            qs = qs.filter(user__icontains=user_filter)
        if action_filter:
            qs = qs.filter(action__icontains=action_filter)
        return qs[:200]   # cap at 200 rows
