from rest_framework import serializers
from .models import Contract
from apps.entities.serializers import EntitySerializer


class ContractSerializer(serializers.ModelSerializer):
    entity_detail = EntitySerializer(source="entity", read_only=True)

    class Meta:
        model  = Contract
        fields = (
            "id", "entity", "entity_detail", "period",
            "status", "total_kpis", "reviewer", "signed_date",
        )
