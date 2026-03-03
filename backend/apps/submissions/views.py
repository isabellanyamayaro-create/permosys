from datetime import date
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.accounts.permissions import IsEntity, IsCEO, IsAnyAuthenticated
from apps.audit.models import AuditLog
from .models import Submission
from .serializers import (
    SubmissionSerializer,
    SubmissionCreateSerializer,
    ApprovalActionSerializer,
)


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

        if user.role == "entity" and user.entity:
            return qs.filter(entity=user.entity)

        # CEO: only submissions for entities linked to this CEO
        if user.role == "ceo" and user.entity:
            return qs.filter(entity=user.entity)

        # admin / me: optional filter
        entity_id = self.request.query_params.get("entity")
        if entity_id:
            qs = qs.filter(entity_id=entity_id)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        submission = serializer.save()
        _log("Submission Created", user, str(submission))


class SubmissionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = SubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs   = Submission.objects.select_related("entity").prefetch_related("sections", "kpis")
        if user.role == "entity" and user.entity:
            return qs.filter(entity=user.entity)
        if user.role == "ceo" and user.entity:
            return qs.filter(entity=user.entity)
        return qs


# ---------------------------------------------------------------------------
# CEO Approvals
# ---------------------------------------------------------------------------

class PendingApprovalsView(generics.ListAPIView):
    """
    CEO-scoped: returns only Pending submissions for the CEO's own entity.
    This is the SERVER-SIDE fix for the CEO scoping bug.
    """
    serializer_class   = SubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs   = Submission.objects.filter(
            status=Submission.Status.PENDING
        ).select_related("entity").prefetch_related("sections", "kpis")

        # CEO can only approve submissions for their assigned entity
        if user.role == "ceo" and user.entity:
            return qs.filter(entity=user.entity)

        # Admin / ME can see all pending
        return qs


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def approve_or_reject(request, pk):
    """
    CEO approves or rejects a submission.
    Enforces entity scoping — a CEO can only act on their entity's submissions.
    """
    user = request.user
    try:
        qs = Submission.objects.select_related("entity")
        if user.role == "ceo" and user.entity:
            submission = qs.get(pk=pk, entity=user.entity)
        else:
            submission = qs.get(pk=pk)
    except Submission.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = ApprovalActionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    action  = serializer.validated_data["action"]
    comment = serializer.validated_data["comment"]

    if action == "approve":
        submission.status      = Submission.Status.APPROVED
        submission.reviewed_by  = user.name
        submission.review_date  = date.today()
        submission.ceo_comment  = comment
        submission.save()
        _log("Submission Approved", user, str(submission), comment)
        return Response({"detail": "Submission approved."})
    else:
        submission.status      = Submission.Status.REJECTED
        submission.reviewed_by  = user.name
        submission.review_date  = date.today()
        submission.ceo_comment  = comment
        submission.save()
        _log("Submission Rejected", user, str(submission), comment)
        return Response({"detail": "Submission rejected."})


# ---------------------------------------------------------------------------
# Reviewed (approved / rejected history) — CEO scoped
# ---------------------------------------------------------------------------

class ReviewedSubmissionsView(generics.ListAPIView):
    """Returns submissions that have already been approved or rejected (CEO-scoped)."""
    serializer_class   = SubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs   = Submission.objects.filter(
            status__in=[Submission.Status.APPROVED, Submission.Status.REJECTED]
        ).select_related("entity").prefetch_related("sections", "kpis")

        if user.role == "ceo" and user.entity:
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
