from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Avg, Count
from apps.submissions.models import Submission, SectionScore
from apps.entities.models import Entity


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    """
    Returns dashboard statistics scoped by role:
    - entity: stats for their own entity
    - ceo: stats for their assigned entity + pending approvals count
    - admin/me: system-wide stats
    """
    user = request.user

    if user.role == "entity" and user.entity:
        subs = Submission.objects.filter(entity=user.entity)
    elif user.role == "ceo" and user.entity:
        subs = Submission.objects.filter(entity=user.entity)
    else:
        subs = Submission.objects.all()

    total       = subs.count()
    approved    = subs.filter(status="Approved").count()
    pending     = subs.filter(status="Pending").count()
    rejected    = subs.filter(status="Rejected").count()
    avg_score   = subs.filter(status="Approved").aggregate(avg=Avg("overall_score"))["avg"] or 0

    # Latest 5 submissions
    recent = subs.select_related("entity").order_by("-submitted_date")[:5]
    recent_data = [
        {
            "id":             s.id,
            "entity":         s.entity.name,
            "quarter":        s.quarter,
            "period":         s.period,
            "status":         s.status,
            "overall_score":  s.overall_score,
            "submitted_date": s.submitted_date,
        }
        for s in recent
    ]

    # Entity ranking (approved submissions average score)
    entity_scores = (
        Submission.objects
        .filter(status="Approved")
        .values("entity__id", "entity__name", "entity__short_name")
        .annotate(avg_score=Avg("overall_score"), total=Count("id"))
        .order_by("-avg_score")
    )

    response_data = {
        "total_submissions": total,
        "approved":          approved,
        "pending":           pending,
        "rejected":          rejected,
        "avg_score":         round(avg_score, 2),
        "recent_submissions": recent_data,
        "entity_ranking":    list(entity_scores),
    }

    # CEO extra: performance trend per quarter
    if user.role in ("ceo", "admin", "me"):
        trend = (
            subs
            .filter(status="Approved")
            .values("quarter", "period")
            .annotate(avg=Avg("overall_score"))
            .order_by("period", "quarter")
        )
        response_data["trend"] = list(trend)

    return Response(response_data)
