from datetime import date
from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.accounts.permissions import IsEntity, IsAnyAuthenticated
from apps.audit.models import AuditLog
from apps.email_utils import send_system_email
from .models import Submission, KpiActual, SectionScore
from .serializers import (
    SubmissionSerializer,
    SubmissionCreateSerializer,
    ApprovalActionSerializer,
)

User = get_user_model()


def _log(action: str, user, target: str, details: str = ""):
    AuditLog.objects.create(
        action=action,
        user=user.email,
        role=user.role,
        target=target,
        details=details,
    )


class SubmissionListCreateView(generics.ListCreateAPIView):
    """
    GET  — entity users see only their own submissions.
           CEO/admin/ME see all or filtered by entity query param.
    POST — entity users create new submission (scoped to their entity).
    """
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return SubmissionCreateSerializer
        return SubmissionSerializer

    def get_queryset(self):
        user = self.request.user
        qs   = Submission.objects.select_related("entity").prefetch_related("sections", "kpis")

        # Entity users only see their own entity's submissions
        if user.role == "entity" and user.entity:
            return qs.filter(entity=user.entity)

        # admin / me: optional filter by entity
        entity_id = self.request.query_params.get("entity")
        if entity_id:
            qs = qs.filter(entity_id=entity_id)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        submission = serializer.save()
        _log("Submission Created", user, str(submission))

        reviewers = User.objects.filter(role__in=["me", "admin"], is_active=True).values_list("email", flat=True)
        send_system_email(
            subject=f"New submission: {submission.entity.name} {submission.quarter} {submission.period}",
            message=(
                f"A new submission was created by {user.name} ({user.email}).\n"
                f"Entity: {submission.entity.name}\n"
                f"Quarter: {submission.quarter}\n"
                f"Period: {submission.period}\n"
                f"Status: {submission.status}"
            ),
            recipients=reviewers,
        )


class SubmissionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = SubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs   = Submission.objects.select_related("entity").prefetch_related("sections", "kpis")
        if user.role == "entity" and user.entity:
            return qs.filter(entity=user.entity)
        return qs


class PendingApprovalsView(generics.ListAPIView):
    """M&E consultants and admins see all pending approvals."""
    serializer_class   = SubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Submission.objects
            .filter(status=Submission.Status.PENDING)
            .select_related("entity")
            .prefetch_related("sections", "kpis")
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def approve_or_reject(request, pk):
    """M&E/Admin only. Accepts per-KPI ratings and saves them before approving/rejecting."""
    user = request.user
    if user.role not in ("me", "admin"):
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    try:
        submission = Submission.objects.prefetch_related("kpis").get(pk=pk)
    except Submission.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = ApprovalActionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    action           = serializer.validated_data["action"]
    reviewer_comment = serializer.validated_data["reviewer_comment"]
    kpi_ratings      = serializer.validated_data.get("kpi_ratings", [])

    # Save per-KPI consultant / agreed ratings and recalculate weighted scores
    if kpi_ratings:
        rating_map = {r["kpi_id"]: r for r in kpi_ratings}
        for kpi_actual in submission.kpis.all():
            rating = rating_map.get(kpi_actual.kpi_id)
            if rating:
                kpi_actual.consultant_rating = rating["consultant_rating"]
                kpi_actual.agreed_rating     = rating["agreed_rating"]
                kpi_actual.recommendation    = rating.get("recommendation", "")
                kpi_actual.weighted          = round(kpi_actual.agreed_rating * kpi_actual.weight / 100, 4)
                kpi_actual.save()

        # Recompute section scores using new agreed ratings
        submission.sections.all().delete()
        area_groups: dict = {}
        for kpi_actual in submission.kpis.all():
            area_groups.setdefault(kpi_actual.area, []).append(kpi_actual)
        for area, kpi_list in area_groups.items():
            total_weight   = sum(k.weight for k in kpi_list)
            total_weighted = sum(k.weighted for k in kpi_list)
            # score = section average on 1-6 scale
            score = round(total_weighted * 100 / total_weight, 2) if total_weight else 0
            SectionScore.objects.create(
                submission=submission, name=area,
                score=score, weight=total_weight, weighted=round(total_weighted, 4),
            )

        # Recompute overall score — sum of all weighted scores = value on 0-6 scale
        all_kpis = list(submission.kpis.all())
        total_ws = sum(k.weighted for k in all_kpis)
        submission.overall_score = round(total_ws, 2)

    submission.reviewed_by      = user.name
    submission.review_date      = date.today()
    submission.reviewer_comment = reviewer_comment

    if action == "approve":
        submission.status = Submission.Status.APPROVED
        submission.save()
        _log("Submission Approved", user, str(submission), reviewer_comment)

        entity_users = User.objects.filter(
            role="entity",
            entity=submission.entity,
            is_active=True,
        ).values_list("email", flat=True)
        send_system_email(
            subject=f"Submission approved: {submission.entity.name} {submission.quarter} {submission.period}",
            message=(
                f"Your submission has been approved by {user.name}.\n"
                f"Entity: {submission.entity.name}\n"
                f"Quarter: {submission.quarter}\n"
                f"Period: {submission.period}\n"
                f"Reviewer comment: {reviewer_comment or 'N/A'}"
            ),
            recipients=entity_users,
        )
        return Response({"detail": "Submission approved."})
    else:
        submission.status = Submission.Status.REJECTED
        submission.save()
        _log("Submission Rejected", user, str(submission), reviewer_comment)

        entity_users = User.objects.filter(
            role="entity",
            entity=submission.entity,
            is_active=True,
        ).values_list("email", flat=True)
        send_system_email(
            subject=f"Submission rejected: {submission.entity.name} {submission.quarter} {submission.period}",
            message=(
                f"Your submission has been rejected by {user.name}.\n"
                f"Entity: {submission.entity.name}\n"
                f"Quarter: {submission.quarter}\n"
                f"Period: {submission.period}\n"
                f"Reviewer comment: {reviewer_comment or 'N/A'}"
            ),
            recipients=entity_users,
        )
        return Response({"detail": "Submission rejected."})


class ReviewedSubmissionsView(generics.ListAPIView):
    """Returns submissions that have already been approved or rejected."""
    serializer_class   = SubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs   = Submission.objects.filter(
            status__in=[Submission.Status.APPROVED, Submission.Status.REJECTED]
        ).select_related("entity").prefetch_related("sections", "kpis")
        if user.role == "entity" and user.entity:
            return qs.filter(entity=user.entity)
        return qs


# ---------------------------------------------------------------------------
# KPI template for entity submission form
# ---------------------------------------------------------------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def kpi_template(request):
    """Returns the KPI definitions the entity should fill in."""
    from apps.kpis.models import KpiDefinition
    from apps.kpis.serializers import KpiDefinitionSerializer
    kpis = KpiDefinition.objects.all()
    return Response(KpiDefinitionSerializer(kpis, many=True).data)


# ---------------------------------------------------------------------------
# Reports
# ---------------------------------------------------------------------------

class ReportsView(generics.ListAPIView):
    serializer_class   = SubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs   = Submission.objects.filter(
            status=Submission.Status.APPROVED
        ).select_related("entity").prefetch_related("sections", "kpis")

        if user.role in ("entity",) and user.entity:
            return qs.filter(entity=user.entity)
        return qs
