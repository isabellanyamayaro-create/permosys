from django.contrib import admin
from .models import Contract


@admin.register(Contract)
class ContractAdmin(admin.ModelAdmin):
    list_display  = ("entity", "period", "status", "total_kpis", "reviewer", "signed_date")
    list_filter   = ("status", "entity")
    search_fields = ("entity__name", "reviewer")
