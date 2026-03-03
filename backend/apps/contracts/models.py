from django.db import models
from apps.entities.models import Entity


class Contract(models.Model):
    class Status(models.TextChoices):
        ACTIVE            = "Active",            "Active"
        PENDING_SIGNATURE = "Pending Signature", "Pending Signature"
        EXPIRED           = "Expired",           "Expired"

    entity       = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name="contracts")
    period       = models.CharField(max_length=20)           # e.g. "2025/26"
    status       = models.CharField(max_length=30, choices=Status.choices, default=Status.ACTIVE)
    total_kpis   = models.PositiveIntegerField(default=0)
    reviewer     = models.CharField(max_length=150, blank=True)
    signed_date  = models.DateField(null=True, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "pms_contracts"
        ordering = ["-created_at"]
        unique_together = [("entity", "period")]

    def __str__(self):
        return f"{self.entity.name} — {self.period} ({self.status})"
