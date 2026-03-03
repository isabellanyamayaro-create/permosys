from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display  = ("action", "user", "role", "target", "timestamp")
    list_filter   = ("role", "action")
    search_fields = ("user", "target")
    readonly_fields = ("timestamp",)
