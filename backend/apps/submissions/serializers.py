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
            # Consultant-defined (read-only after creation)
            "year_target", "period_target", "allowable_variance", "prev_year_performance",
            # Entity-supplied
            "actual", "variance",
            # Ratings
            "self_rating", "consultant_rating", "agreed_rating",
            # Scoring
            "raw_score", "weight", "weighted",
            # Comments
            "evaluatee_comment", "recommendation",
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
            "reviewer_comment", "overall_comment", "created_at", "updated_at",
            "sections", "kpis",
        )
        read_only_fields = (
            "id", "submitted_date", "created_at", "updated_at",
            "sections", "kpis", "entity_name",
        )

    def get_entity_name(self, obj):
        return obj.entity.name if obj.entity else None


# ---- per-KPI input from the entity at submission time ----
class KpiActualInputSerializer(serializers.Serializer):
    kpi_id             = serializers.IntegerField()
    name               = serializers.CharField(max_length=200)
    area               = serializers.CharField(max_length=50)
    unit               = serializers.CharField(max_length=20)
    year_target        = serializers.FloatField()
    period_target      = serializers.FloatField()
    allowable_variance = serializers.FloatField(default=5.0)
    actual             = serializers.FloatField()
    self_rating        = serializers.IntegerField(min_value=1, max_value=6, required=False, allow_null=True)
    weight             = serializers.IntegerField(min_value=0)
    evaluatee_comment  = serializers.CharField(allow_blank=True, default="")


class SubmissionCreateSerializer(serializers.ModelSerializer):
    """Used for creating a new submission with nested KPI actuals."""
    kpis = KpiActualInputSerializer(many=True)

    class Meta:
        model  = Submission
        fields = (
            "entity", "quarter", "period",
            "submitted_by", "kpi_count", "overall_score",
            "status", "overall_comment", "kpis",
        )

    def create(self, validated_data):
        kpis_data  = validated_data.pop("kpis")
        submission = Submission.objects.create(**validated_data)

        area_groups: dict = {}
        for k in kpis_data:
            variance    = KpiActual.calculate_variance(k["period_target"], k["actual"])
            raw_score   = KpiActual.calculate_raw_score(variance)
            self_rating = k.get("self_rating") or raw_score
            weighted    = round(self_rating * k["weight"] / 100, 4)

            # Auto-populate prev_year_performance from last approved KpiActual for same entity+kpi
            last_approved = (
                KpiActual.objects
                .filter(
                    kpi_id=k["kpi_id"],
                    submission__entity=submission.entity,
                    submission__status=Submission.Status.APPROVED,
                )
                .order_by("-submission__submitted_date")
                .first()
            )
            prev_year = last_approved.actual if last_approved else None

            KpiActual.objects.create(
                submission=submission,
                kpi_id=k["kpi_id"],
                name=k["name"],
                area=k["area"],
                unit=k["unit"],
                year_target=k["year_target"],
                period_target=k["period_target"],
                allowable_variance=k["allowable_variance"],
                prev_year_performance=prev_year,
                actual=k["actual"],
                variance=variance,
                raw_score=raw_score,
                self_rating=self_rating,
                weight=k["weight"],
                weighted=weighted,
                evaluatee_comment=k.get("evaluatee_comment", ""),
            )
            area_groups.setdefault(k["area"], []).append({"weight": k["weight"], "weighted": weighted})

        for area, kpi_list in area_groups.items():
            total_weight   = sum(k["weight"] for k in kpi_list)
            total_weighted = sum(k["weighted"] for k in kpi_list)
            # score = section average on 1-6 scale (reverse the /100 per-KPI weighting)
            score = round(total_weighted * 100 / total_weight, 2) if total_weight else 0
            SectionScore.objects.create(
                submission=submission,
                name=area,
                score=score,
                weight=total_weight,
                weighted=round(total_weighted, 4),
            )

        return submission


# ---- per-KPI rating from M&E during approval ----
class KpiRatingSerializer(serializers.Serializer):
    kpi_id            = serializers.IntegerField()
    consultant_rating = serializers.IntegerField(min_value=1, max_value=6)
    agreed_rating     = serializers.IntegerField(min_value=1, max_value=6)
    recommendation    = serializers.CharField(allow_blank=True, default="")


class ApprovalActionSerializer(serializers.Serializer):
    action           = serializers.ChoiceField(choices=["approve", "reject"])
    reviewer_comment = serializers.CharField(allow_blank=True, default="")
    kpi_ratings      = KpiRatingSerializer(many=True, required=False, default=list)
