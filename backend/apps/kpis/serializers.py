from rest_framework import serializers
from .models import KpiDefinition


class KpiDefinitionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = KpiDefinition
        fields = ("id", "name", "area", "unit", "target", "weight")
