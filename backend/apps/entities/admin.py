from django.contrib import admin
from .models import Entity


@admin.register(Entity)
class EntityAdmin(admin.ModelAdmin):
    list_display  = ("name", "short_name")
    search_fields = ("name", "short_name")
