from django.contrib import admin
from .models import Submission, SectionScore, KpiActual


class SectionScoreInline(admin.TabularInline):
    model = SectionScore
    extra = 0

class KpiActualInline(admin.TabularInline):
    model = KpiActual
    extra = 0


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display  = ("entity", "quarter", "period", "status", "overall_score", "submitted_date")
    list_filter   = ("status", "quarter", "entity")
    search_fields = ("entity__name", "submitted_by")
    inlines       = [SectionScoreInline, KpiActualInline]



