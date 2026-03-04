from django.db import models


class KpiDefinition(models.Model):
    """Master KPI library — a template that entities use in their contracts."""

    class Area(models.TextChoices):
        OUTCOMES         = "Outcomes",         "Outcomes"
        OUTPUTS          = "Outputs",           "Outputs"
        SERVICE_DELIVERY = "Service Delivery",  "Service Delivery"
        MANAGEMENT       = "Management",        "Management"
        CROSS_CUTTING    = "Cross-Cutting",     "Cross-Cutting"

    name                  = models.CharField(max_length=300)
    area                  = models.CharField(max_length=50, choices=Area.choices)
    unit                  = models.CharField(max_length=20)
    target                = models.FloatField(help_text="Annual year target")
    weight                = models.FloatField(help_text="Weighting for this KPI (supports 0.5)")
    allowable_variance    = models.FloatField(default=5.0, help_text="Acceptable variance % (e.g. 5 means ±5%)")
    prev_year_performance = models.FloatField(null=True, blank=True, help_text="Last year's baseline performance")
    description           = models.TextField(blank=True, default="", help_text="Addendum explanation shown as tooltip on submission form")

    class Meta:
        db_table = "pms_kpi_definitions"
        ordering = ["area", "name"]

    def __str__(self):
        return f"{self.name} ({self.area})"
