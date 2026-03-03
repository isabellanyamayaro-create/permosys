"""
Seed management command — populates the database with realistic demo data.
Run: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.entities.models import Entity
from apps.kpis.models import KpiDefinition
from apps.contracts.models import Contract
from apps.submissions.models import Submission, SectionScore, KpiActual

User = get_user_model()

ENTITIES = [
    {"name": "Ministry of Health and Social Services",   "short_name": "MHSS"},
    {"name": "Ministry of Education, Arts and Culture",  "short_name": "MEAC"},
    {"name": "Ministry of Finance and Public Enterprises","short_name": "MFPE"},
    {"name": "Ministry of Transport and Infrastructure", "short_name": "MTI"},
    {"name": "Ministry of Agriculture, Water and Land", "short_name": "MAWL"},
]

KPI_DEFS = [
    # Outcomes
    {"name": "Reduction in maternal mortality rate",     "area": "Outcomes", "unit": "per 100k", "target": 5.0,  "weight": 10},
    {"name": "Improvement in student pass rate",         "area": "Outcomes", "unit": "%",        "target": 80.0, "weight": 10},
    # Outputs
    {"name": "Number of health facilities constructed",  "area": "Outputs",  "unit": "count",    "target": 10.0, "weight": 8},
    {"name": "Number of classrooms built",               "area": "Outputs",  "unit": "count",    "target": 200.0,"weight": 8},
    # Service Delivery
    {"name": "% of patients seen within 30 minutes",     "area": "Service Delivery", "unit": "%", "target": 90.0,"weight": 8},
    {"name": "Average response time to tax queries",     "area": "Service Delivery", "unit": "days","target": 3.0, "weight": 8},
    # Management
    {"name": "Budget utilisation rate",                  "area": "Management","unit": "%",        "target": 95.0, "weight": 8},
    {"name": "Staff performance reviews completed",      "area": "Management","unit": "%",        "target": 100.0,"weight": 8},
    # Cross-Cutting
    {"name": "% of women in management positions",       "area": "Cross-Cutting","unit": "%",     "target": 50.0, "weight": 7},
    {"name": "# of anti-corruption training sessions",   "area": "Cross-Cutting","unit": "count", "target": 4.0,  "weight": 7},
    {"name": "Energy efficiency improvement",            "area": "Cross-Cutting","unit": "%",     "target": 15.0, "weight": 6},
    {"name": "Digital services adoption rate",           "area": "Cross-Cutting","unit": "%",     "target": 60.0, "weight": 6},
]


class Command(BaseCommand):
    help = "Seed the database with demo data for the Performance Management System"

    def handle(self, *args, **options):
        self.stdout.write("🌱 Seeding PMS database …")

        # 1. Entities
        self.stdout.write("Creating entities …")
        entity_objs = {}
        for e in ENTITIES:
            obj, created = Entity.objects.get_or_create(
                short_name=e["short_name"], defaults={"name": e["name"]}
            )
            entity_objs[e["short_name"]] = obj
            if created:
                self.stdout.write(f"  + {obj.name}")

        # 2. KPI definitions
        self.stdout.write("Creating KPI library …")
        kpi_objs = []
        for k in KPI_DEFS:
            obj, created = KpiDefinition.objects.get_or_create(
                name=k["name"],
                defaults={"area": k["area"], "unit": k["unit"],
                          "target": k["target"], "weight": k["weight"]},
            )
            kpi_objs.append(obj)

        # 3. Users
        self.stdout.write("Creating users …")

        # System admin
        User.objects.get_or_create(
            email="admin@pms.gov.zw",
            defaults={"name": "System Administrator", "role": "admin",
                      "is_staff": True, "is_superuser": True,
                      "badge": "SA", "initials": "SA", "label": "Admin"},
        )[0].set_password("Admin@1234") or \
            User.objects.filter(email="admin@pms.gov.zw").update()
        admin_user = User.objects.get(email="admin@pms.gov.zw")
        admin_user.set_password("Admin@1234")
        admin_user.save()

        # ME Consultant
        me_user, _ = User.objects.get_or_create(
            email="consultant@pms.gov.zw",
            defaults={"name": "M&E Consultant", "role": "me",
                      "badge": "ME", "initials": "MC", "label": "M&E"},
        )
        me_user.set_password("Consult@1234")
        me_user.save()

        # CEO + entity user per entity
        ceo_entity   = entity_objs["MHSS"]
        entity_entity = entity_objs["MHSS"]

        for short, entity in entity_objs.items():
            ceo_email    = f"ceo.{short.lower()}@pms.gov.zw"
            entity_email = f"entity.{short.lower()}@pms.gov.zw"

            ceo, _ = User.objects.get_or_create(
                email=ceo_email,
                defaults={"name": f"CEO {entity.short_name}", "role": "ceo",
                          "entity": entity, "badge": "C",
                          "initials": entity.short_name[:2], "label": "CEO"},
            )
            ceo.set_password("Ceo@12345")
            ceo.entity = entity
            ceo.save()

            eu, _ = User.objects.get_or_create(
                email=entity_email,
                defaults={"name": f"{entity.short_name} User", "role": "entity",
                          "entity": entity, "badge": "E",
                          "initials": entity.short_name[:2], "label": "Entity"},
            )
            eu.set_password("Entity@1234")
            eu.entity = entity
            eu.save()

        # 4. Contracts
        self.stdout.write("Creating contracts …")
        for entity in entity_objs.values():
            Contract.objects.get_or_create(
                entity=entity, period="2024/25",
                defaults={
                    "status":     Contract.Status.ACTIVE,
                    "total_kpis": len(KPI_DEFS),
                    "reviewer":   "System Administrator",
                    "signed_date": "2024-04-01",
                },
            )

        # 5. Submissions (one approved, one pending per entity)
        self.stdout.write("Creating sample submissions …")
        for entity in entity_objs.values():
            # Approved Q1
            sub, created = Submission.objects.get_or_create(
                entity=entity, quarter="Q1", period="2024/25",
                defaults={
                    "submitted_by": f"{entity.short_name} User",
                    "kpi_count":    len(kpi_objs),
                    "overall_score": 72.5,
                    "status":        Submission.Status.APPROVED,
                    "reviewed_by":   f"CEO {entity.short_name}",
                    "ceo_comment":   "Good performance overall.",
                },
            )
            if created:
                _create_kpi_actuals(sub, kpi_objs, multiplier=0.9)

            # Pending Q2
            sub2, created2 = Submission.objects.get_or_create(
                entity=entity, quarter="Q2", period="2024/25",
                defaults={
                    "submitted_by": f"{entity.short_name} User",
                    "kpi_count":    len(kpi_objs),
                    "overall_score": 68.0,
                    "status":        Submission.Status.PENDING,
                },
            )
            if created2:
                _create_kpi_actuals(sub2, kpi_objs, multiplier=0.85)

        self.stdout.write(self.style.SUCCESS("✅ Seeding complete!"))
        self.stdout.write("")
        self.stdout.write("Demo credentials:")
        self.stdout.write("  admin@pms.gov.zw        / Admin@1234   (System Admin)")
        self.stdout.write("  consultant@pms.gov.zw   / Consult@1234 (M&E Consultant)")
        self.stdout.write("  ceo.mhss@pms.gov.zw     / Ceo@12345    (CEO - MHSS)")
        self.stdout.write("  entity.mhss@pms.gov.zw  / Entity@1234  (Entity - MHSS)")


def _create_kpi_actuals(submission: Submission, kpis: list, multiplier: float):
    """Creates KpiActual rows and SectionScore rows for a submission."""
    area_groups: dict = {}
    for kpi in kpis:
        actual   = round(kpi.target * multiplier, 2)
        variance = KpiActual.calculate_variance(kpi.target, actual)
        raw      = KpiActual.calculate_raw_score(variance)
        weighted = round(raw * kpi.weight / 6, 2)

        KpiActual.objects.get_or_create(
            submission=submission, kpi_id=kpi.id,
            defaults={
                "name":      kpi.name,
                "area":      kpi.area,
                "unit":      kpi.unit,
                "target":    kpi.target,
                "actual":    actual,
                "variance":  variance,
                "raw_score": raw,
                "weight":    kpi.weight,
                "weighted":  weighted,
            },
        )
        area_groups.setdefault(kpi.area, []).append(
            {"weight": kpi.weight, "weighted": weighted}
        )

    for area, items in area_groups.items():
        total_weight   = sum(i["weight"] for i in items)
        total_weighted = sum(i["weighted"] for i in items)
        score = round(total_weighted / total_weight * 10, 2) if total_weight else 0
        SectionScore.objects.get_or_create(
            submission=submission, name=area,
            defaults={"score": score, "weight": total_weight, "weighted": total_weighted},
        )
