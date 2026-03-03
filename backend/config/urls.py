from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def health_check(request):
    from django.utils import timezone
    return JsonResponse({"status": "ok", "timestamp": timezone.now().isoformat()})


urlpatterns = [
    path("admin/",            admin.site.urls),
    path("api/health/",       health_check),
    path("api/auth/",         include("apps.accounts.urls")),
    path("api/entities/",     include("apps.entities.urls")),
    path("api/kpis/",         include("apps.kpis.urls")),
    path("api/contracts/",    include("apps.contracts.urls")),
    path("api/submissions/",  include("apps.submissions.urls")),
    path("api/approvals/",    include("apps.submissions.approval_urls")),
    path("api/reviewed/",     include("apps.submissions.reviewed_urls")),
    path("api/dashboard/",    include("apps.dashboard.urls")),
    path("api/audit-log/",    include("apps.audit.urls")),
    path("api/users/",        include("apps.accounts.user_urls")),
    path("api/reports/",      include("apps.submissions.report_urls")),
]
