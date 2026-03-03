from rest_framework import serializers
from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model  = AuditLog
        fields = ("id", "action", "user", "role", "target", "details", "timestamp")
        read_only_fields = fields
