from django.db import models


class KpiDefinition(models.Model):
    """Master KPI library — a template that entities use in their contracts."""

    class Area(models.TextChoices):
        OUTCOMES         = "Outcomes",         "Outcomes"
        OUTPUTS          = "Outputs",           "Outputs"
        SERVICE_DELIVERY = "Service Delivery",  "Service Delivery"
        MANAGEMENT       = "Management",        "Management"
        CROSS_CUTTING    = "Cross-Cutting",     "Cross-Cutting"

    name   = models.CharField(max_length=200)
    area   = models.CharField(max_length=50, choices=Area.choices)
    unit   = models.CharField(max_length=20)
    target = models.FloatField()
    weight = models.PositiveIntegerField()

    class Meta:
        db_table = "pms_kpi_definitions"
        ordering = ["area", "name"]

    def __str__(self):
        return f"{self.name} ({self.area})"
