from django.db import models


class AuditLog(models.Model):
    action    = models.CharField(max_length=100)
    user      = models.CharField(max_length=150)
    role      = models.CharField(max_length=30)
    target    = models.CharField(max_length=200)
    details   = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "pms_audit_logs"
        ordering = ["-timestamp"]

    def __str__(self):
        return f"[{self.timestamp}] {self.action} by {self.user}"
