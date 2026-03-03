from django.db import models
from apps.entities.models import Entity


class Submission(models.Model):
    class Status(models.TextChoices):
        DRAFT        = "Draft",        "Draft"
        PENDING      = "Pending",      "Pending"
        UNDER_REVIEW = "Under Review", "Under Review"
        APPROVED     = "Approved",     "Approved"
        REJECTED     = "Rejected",     "Rejected"

    class Quarter(models.TextChoices):
        Q1 = "Q1", "Q1"
        Q2 = "Q2", "Q2"
        Q3 = "Q3", "Q3"
        Q4 = "Q4", "Q4"

    entity         = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name="submissions")
    quarter        = models.CharField(max_length=2, choices=Quarter.choices)
    period         = models.CharField(max_length=20)          # e.g. "2025/26"
    submitted_by   = models.CharField(max_length=150)
    submitted_date = models.DateField(auto_now_add=True)
    kpi_count      = models.PositiveIntegerField(default=0)
    overall_score  = models.FloatField(default=0.0)
    status         = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    reviewed_by    = models.CharField(max_length=150, blank=True)
    review_date    = models.DateField(null=True, blank=True)
    ceo_comment    = models.TextField(blank=True)
    overall_comment = models.TextField(blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "pms_submissions"
        ordering = ["-submitted_date"]

    def __str__(self):
        return f"{self.entity.name} {self.quarter} {self.period} — {self.status}"


class SectionScore(models.Model):
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE, related_name="sections")
    name       = models.CharField(max_length=50)
    score      = models.FloatField()
    weight     = models.PositiveIntegerField()
    weighted   = models.FloatField()

    class Meta:
        db_table = "pms_section_scores"

    def __str__(self):
        return f"{self.submission} — {self.name}: {self.score}"


class KpiActual(models.Model):
    submission  = models.ForeignKey(Submission, on_delete=models.CASCADE, related_name="kpis")
    kpi_id      = models.PositiveIntegerField()
    name        = models.CharField(max_length=200)
    area        = models.CharField(max_length=50)
    unit        = models.CharField(max_length=20)
    target      = models.FloatField()
    actual      = models.FloatField()
    variance    = models.FloatField()
    raw_score   = models.PositiveIntegerField()
    weight      = models.PositiveIntegerField()
    weighted    = models.FloatField()
    comment     = models.TextField(blank=True)

    class Meta:
        db_table = "pms_kpi_actuals"

    @staticmethod
    def calculate_variance(target: float, actual: float) -> float:
        if target == 0:
            return 0.0
        return round(((actual - target) / target) * 100, 2)

    @staticmethod
    def calculate_raw_score(variance: float) -> int:
        if variance >= 0:   return 6
        if variance >= -5:  return 5
        if variance >= -10: return 4
        if variance >= -20: return 3
        if variance >= -30: return 2
        return 1

    def __str__(self):
        return f"{self.name}: actual={self.actual}"
