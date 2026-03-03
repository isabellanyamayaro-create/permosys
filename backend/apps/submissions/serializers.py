from rest_framework import serializers
from .models import Submission, SectionScore, KpiActual


class SectionScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model  = SectionScore
        fields = ("id", "name", "score", "weight", "weighted")


class KpiActualSerializer(serializers.ModelSerializer):
    class Meta:
        model  = KpiActual
        fields = (
            "id", "kpi_id", "name", "area", "unit",
            "target", "actual", "variance", "raw_score",
            "weight", "weighted", "comment",
        )


class SubmissionSerializer(serializers.ModelSerializer):
    sections    = SectionScoreSerializer(many=True, read_only=True)
    kpis        = KpiActualSerializer(many=True, read_only=True)
    entity_name = serializers.SerializerMethodField()

    class Meta:
        model  = Submission
        fields = (
            "id", "entity", "entity_name", "quarter", "period",
            "submitted_by", "submitted_date", "kpi_count",
            "overall_score", "status", "reviewed_by", "review_date",
            "ceo_comment", "overall_comment", "created_at", "updated_at",
            "sections", "kpis",
        )
        read_only_fields = (
            "id", "submitted_date", "created_at", "updated_at",
            "sections", "kpis", "entity_name",
        )

    def get_entity_name(self, obj):
        return obj.entity.name if obj.entity else None


class SubmissionCreateSerializer(serializers.ModelSerializer):
    """Used for creating a new submission with nested KPI actuals."""
    kpis = KpiActualSerializer(many=True)

    class Meta:
        model  = Submission
        fields = (
            "entity", "quarter", "period",
            "submitted_by", "kpi_count", "overall_score",
            "status", "overall_comment", "kpis",
        )

    def create(self, validated_data):
        kpis_data    = validated_data.pop("kpis")
        submission   = Submission.objects.create(**validated_data)

        # Build section scores by area
        area_groups: dict = {}
        for k in kpis_data:
            KpiActual.objects.create(submission=submission, **k)
            area = k["area"]
            area_groups.setdefault(area, []).append(k)

        for area, kpi_list in area_groups.items():
            total_weight  = sum(k["weight"] for k in kpi_list)
            total_weighted = sum(k["weighted"] for k in kpi_list)
            score = round(total_weighted / total_weight * 10, 2) if total_weight else 0
            SectionScore.objects.create(
                submission=submission,
                name=area,
                score=score,
                weight=total_weight,
                weighted=total_weighted,
            )

        return submission


class ApprovalActionSerializer(serializers.Serializer):
    action  = serializers.ChoiceField(choices=["approve", "reject"])
    comment = serializers.CharField(allow_blank=True, default="")
