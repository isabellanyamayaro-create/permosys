from rest_framework import serializers
from .models import KpiDefinition


class KpiDefinitionSerializer(serializers.ModelSerializer):
    period_target = serializers.SerializerMethodField()

    class Meta:
        model  = KpiDefinition
        fields = (
            "id", "name", "area", "unit",
            "target", "weight",
            "allowable_variance", "prev_year_performance",
            "period_target", "description",
        )

    def get_period_target(self, obj):
        """Returns year_target / 4, rounded to 2 dp."""
        return round(obj.target / 4, 2) if obj.target else 0.0
