from django.contrib import admin
from .models import KpiDefinition


@admin.register(KpiDefinition)
class KpiDefinitionAdmin(admin.ModelAdmin):
    list_display  = ("name", "area", "unit", "target", "weight")
    list_filter   = ("area",)
    search_fields = ("name",)
