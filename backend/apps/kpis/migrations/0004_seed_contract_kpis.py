from django.db import migrations


KPIS = [
    # ── OUTCOMES ──────────────────────────────────────────────────────────────
    {
        "name": "Client Satisfaction Index",
        "area": "Outcomes", "unit": "%", "weight": 3,
        "target": 92, "prev_year_performance": 90, "allowable_variance": 1,
        "description": (
            "An external consultant will be hired to measure client satisfaction during the year. "
            "Measured against speed of service, quality, accessibility, courtesy and information on services."
        ),
    },
    {
        "name": "Employee Satisfaction Index",
        "area": "Outcomes", "unit": "%", "weight": 3,
        "target": 80, "prev_year_performance": 62, "allowable_variance": 9,
        "description": (
            "An external consultant will conduct an employee satisfaction survey covering: "
            "Work environment (infrastructure, industrial relations); "
            "Rewards and recognition (long service awards, bonuses, compensation, medical insurance); "
            "Safety measures (compliance to NSSA regulations)."
        ),
    },
    {
        "name": "Proportion of employees attaining a minimum performance rating of 3",
        "area": "Outcomes", "unit": "%", "weight": 2,
        "target": 100, "prev_year_performance": 100, "allowable_variance": 0,
        "description": "Proportion of all staff members who score a minimum rating of 3 in their individual performance assessments.",
    },
    {
        "name": "Proportion of sectors whose plans are aligned with the ZNASP IV (Private, Public, Faith based, PLHIV, Informal Sector, Young people, Key Populations, Civil society)",
        "area": "Outcomes", "unit": "%", "weight": 8,
        "target": 100, "prev_year_performance": 100, "allowable_variance": 0,
        "description": (
            "Alignment and harmonization of all organised sector strategies with the ZNASP IV (2021-2025). "
            "Covers: Private sector, Public sector, Faith-based organisations, PLHIV networks, Informal sector, "
            "Young people, Key Populations and Civil society."
        ),
    },
    {
        "name": "Proportion of socially contracted organizations implementing HIV and AIDS programs",
        "area": "Outcomes", "unit": "%", "weight": 8,
        "target": 100, "prev_year_performance": 100, "allowable_variance": 0,
        "description": "Increased capacity of partners to deliver HIV and AIDS services. Measures the proportion of ASOs/partners that are socially contracted and actively implementing HIV and AIDS programmes.",
    },
    {
        "name": "Percentage of adults living with HIV who know their HIV status",
        "area": "Outcomes", "unit": "%", "weight": 3,
        "target": 97, "prev_year_performance": 97, "allowable_variance": 2,
        "description": "Outcome 4: Increased uptake of HIV prevention services. Percentage of adults living with HIV who are aware of their HIV status (first 95 of the 95-95-95 targets).",
    },
    {
        "name": "Percentage of PLHIV receiving ART",
        "area": "Outcomes", "unit": "%", "weight": 3,
        "target": 97, "prev_year_performance": 98, "allowable_variance": 2,
        "description": "Percentage of people living with HIV (PLHIV) who know their status and are currently receiving antiretroviral therapy (second 95 of the 95-95-95 targets).",
    },
    {
        "name": "Percentage of PLHIV on ART who have a suppressed viral load",
        "area": "Outcomes", "unit": "%", "weight": 2,
        "target": 95, "prev_year_performance": 95, "allowable_variance": 1,
        "description": "Percentage of PLHIV on ART who have achieved viral load suppression (third 95 of the 95-95-95 targets).",
    },
    {
        "name": "Proportion of implementers with M & E established department",
        "area": "Outcomes", "unit": "%", "weight": 8,
        "target": 96, "prev_year_performance": 85, "allowable_variance": 0,
        "description": "Outcome 5: Strengthened hub of strategic HIV information. Proportion of implementing partners/organisations that have a functioning Monitoring & Evaluation department established.",
    },

    # ── OUTPUTS ───────────────────────────────────────────────────────────────
    {
        "name": "Corporate governance platforms established",
        "area": "Outputs", "unit": "Number", "weight": 2,
        "target": 27, "prev_year_performance": 35, "allowable_variance": 0,
        "description": (
            "Board meetings x4, Board extra ordinary meetings x2, "
            "Board committee meetings x16 (4 committee meetings quarterly), "
            "Board committees extra ordinary meetings (Finance x1, Audit x1), "
            "AGM x1, Board Retreat x1, Board capacity development x1, Board evaluation x1."
        ),
    },
    {
        "name": "Financial Statements Compiled",
        "area": "Outputs", "unit": "Number", "weight": 2,
        "target": 1, "prev_year_performance": 1, "allowable_variance": 0,
        "description": "Annual financial statements compiled and submitted as required by statute.",
    },
    {
        "name": "Goods and services procured",
        "area": "Outputs", "unit": "Number", "weight": 2,
        "target": 1, "prev_year_performance": 1, "allowable_variance": 0,
        "description": "Annual procurement plan for goods and services executed in accordance with PPDPA (Chapter 22.23 of 2017).",
    },
    {
        "name": "Performance management system implemented",
        "area": "Outputs", "unit": "Number", "weight": 2,
        "target": 1, "prev_year_performance": 1, "allowable_variance": 0,
        "description": "Results-based Performance Management System implemented to guide the operations of the organisation.",
    },
    {
        "name": "Commemorations Conducted",
        "area": "Outputs", "unit": "Number", "weight": 2,
        "target": 11, "prev_year_performance": 11, "allowable_variance": 0,
        "description": "National and international AIDS-related commemorations conducted during the year.",
    },
    {
        "name": "Audits conducted",
        "area": "Outputs", "unit": "Number", "weight": 2,
        "target": 70, "prev_year_performance": 72, "allowable_variance": 5,
        "description": "Internal and external audits conducted across all organisational units during the year.",
    },
    {
        "name": "Statutory reports produced",
        "area": "Outputs", "unit": "Number", "weight": 2,
        "target": 4, "prev_year_performance": 4, "allowable_variance": 0,
        "description": "Quarterly and annual statutory reports submitted to the Board, Minister and other government agencies as prescribed.",
    },
    {
        "name": "ASOs socially contracted",
        "area": "Outputs", "unit": "Number", "weight": 2,
        "target": 11, "prev_year_performance": 11, "allowable_variance": 0,
        "description": "AIDS Service Organisations (ASOs) socially contracted to leverage community capacity for HIV and AIDS programme delivery.",
    },
    {
        "name": "ARVs, related medicines and consumables procured",
        "area": "Outputs", "unit": "Percentage", "weight": 2,
        "target": 50, "prev_year_performance": 50, "allowable_variance": 0,
        "description": "Percentage of required ARVs, related medicines and consumables procured within the budget year.",
    },
    {
        "name": "Key reports produced",
        "area": "Outputs", "unit": "Number", "weight": 2,
        "target": 7, "prev_year_performance": 7, "allowable_variance": 0,
        "description": "Key strategic reports (e.g. annual report, M&E reports, programme reports) produced and disseminated.",
    },

    # ── SERVICE DELIVERY ──────────────────────────────────────────────────────
    {
        "name": "Implementation of Client Service Charter",
        "area": "Service Delivery", "unit": "Number", "weight": 4,
        "target": 1, "prev_year_performance": 1, "allowable_variance": 0,
        "description": "Implementation of the Client Service Charter across all service points. Charter commits to: meeting financial obligations on time, answering calls within 3 rings, attending to physical clients within 5 minutes, acknowledging correspondence within 2 days, circulating meeting minutes within 3 days.",
    },
    {
        "name": "Speed of service",
        "area": "Service Delivery", "unit": "%", "weight": 1,
        "target": 95, "prev_year_performance": 95, "allowable_variance": 2,
        "description": (
            "Measured using turnaround time for services (client satisfaction index). "
            "92% of clients who contact NAC should receive services within one hour. "
            "Includes: meeting financial obligations on specified dates, answering calls within 3 rings, "
            "attending to physical clients within 5 minutes with courtesy, "
            "acknowledging correspondence within 2 days, finalising meeting minutes within 3 days."
        ),
    },
    {
        "name": "Quality of service",
        "area": "Service Delivery", "unit": "%", "weight": 1,
        "target": 92, "prev_year_performance": 91, "allowable_variance": 2,
        "description": "Measured against tangibility, reliability, responsiveness, assurance and empathy.",
    },
    {
        "name": "Accessibility",
        "area": "Service Delivery", "unit": "%", "weight": 1,
        "target": 92, "prev_year_performance": 92, "allowable_variance": 2,
        "description": (
            "To always have in place relevant strategic documents on time and in hard and soft formats. "
            "To be available to clients during prescribed business hours (0745hrs–1645hrs)."
        ),
    },
    {
        "name": "Courtesy",
        "area": "Service Delivery", "unit": "%", "weight": 1,
        "target": 92, "prev_year_performance": 90, "allowable_variance": 2,
        "description": (
            "NAC core values shared. 97% of employees should exhibit NAC core values: "
            "Transparency, Accountability, Innovation, Integrity, Teamwork, Professionalism and Inclusiveness."
        ),
    },
    {
        "name": "Information on services",
        "area": "Service Delivery", "unit": "%", "weight": 1,
        "target": 92, "prev_year_performance": 90, "allowable_variance": 2,
        "description": (
            "Timely dissemination of information about NAC services via TV, radio, newspapers, website, "
            "social media platforms, information dissemination platforms and campaigns. "
            "95% of clients should have information on services offered. "
            "Accurate reports provided within specified deadlines. Requests for information responded to as per client expectations."
        ),
    },
    {
        "name": "Signage",
        "area": "Service Delivery", "unit": "Number", "weight": 1,
        "target": 40, "prev_year_performance": 11, "allowable_variance": 10,
        "description": (
            "The organisation has 1 national office, 10 provincial offices and 85 district offices. "
            "All provincial offices and the national office have signage. "
            "During the year, the organisation targets putting signage at 40 of the 85 district offices. "
            "NAC structures have signage to identify themselves when attending to clients."
        ),
    },
    {
        "name": "Service Delivery Innovations",
        "area": "Service Delivery", "unit": "Number", "weight": 4,
        "target": 7, "prev_year_performance": 6, "allowable_variance": 0,
        "description": (
            "New innovations and technologies adopted and implemented: "
            "DHIS 2, HIV prevention programming models, Social Contracting to leverage on community, "
            "Automation of processes (HR, Audit and Administration), Mathematical Modelling."
        ),
    },
    {
        "name": "Resolution of Public Complaints",
        "area": "Service Delivery", "unit": "%", "weight": 6,
        "target": 95, "prev_year_performance": 95, "allowable_variance": 3,
        "description": (
            "Mechanisms to collect and address public complaints including suggestion boxes at strategic positions "
            "and social media platforms. All complaints are attended to on time in an equitable, objective and unbiased manner."
        ),
    },

    # ── MANAGEMENT ────────────────────────────────────────────────────────────
    {
        "name": "Strategic allocation of resources in line with policy priorities",
        "area": "Management", "unit": "%", "weight": 2,
        "target": 100, "prev_year_performance": 100, "allowable_variance": 2,
        "description": (
            "Budget allocations in line with board-approved thematic allocations and disease burden. "
            "Resources allocated per province/district based on disease burden: "
            "Treatment and care 50%, HIV prevention 12%, Administration 30%, M&E and Coordination 5%, "
            "Advocacy and communication 3%."
        ),
    },
    {
        "name": "Value for money (effectiveness, efficiency, economy)",
        "area": "Management", "unit": "%", "weight": 1,
        "target": 100, "prev_year_performance": 100, "allowable_variance": 5,
        "description": "Resources allocated relative to impact on epidemic. Value for money calculated based on reports from PRAZ (effectiveness, efficiency and economy).",
    },
    {
        "name": "Managing within the budget",
        "area": "Management", "unit": "%", "weight": 1,
        "target": 100, "prev_year_performance": 100, "allowable_variance": 5,
        "description": "Management accounts produced and shared periodically highlighting amounts spent vs the budget.",
    },
    {
        "name": "Mobilization of alternative resources (outside Treasury e.g. PPPs)",
        "area": "Management", "unit": "Amount", "weight": 3,
        "target": 3600000000, "prev_year_performance": 2557762990, "allowable_variance": 10,
        "description": (
            "Mobilization of alternative resources outside Treasury (e.g. PPPs). "
            "The organisation has investments and the targeted amount is the interest on investments. "
            "Target: ZWL 3,600,000,000."
        ),
    },
    {
        "name": "Implementation of Corporate Governance Framework",
        "area": "Management", "unit": "%", "weight": 2,
        "target": 100, "prev_year_performance": 100, "allowable_variance": 0,
        "description": (
            "Board meetings x4, Board extra ordinary meetings x2, "
            "Board committee meetings x16 (4 committee meetings quarterly), "
            "Board committees extra ordinary meetings (Finance x1, Audit x1), "
            "AGM x1, Board Retreat x1, Board capacity development x1, Board evaluation x1."
        ),
    },
    {
        "name": "Skills development (Training and Capacity Building)",
        "area": "Management", "unit": "%", "weight": 1,
        "target": 100, "prev_year_performance": 95, "allowable_variance": 5,
        "description": "Skills development programmes conducted for staff in various departments including Trainings, Workshops, Seminars and Wellness (IGPs).",
    },
    {
        "name": "Internal Process Efficiency Measures e.g. ISO Certification",
        "area": "Management", "unit": "Number", "weight": 0.5,
        "target": 1, "prev_year_performance": 0, "allowable_variance": 0,
        "description": "Internal process efficiency measures implemented including compliance to legislation and professional standards, and internal audit.",
    },
    {
        "name": "E-Government Flagships - Number of automated departments",
        "area": "Management", "unit": "Number", "weight": 0.5,
        "target": 8, "prev_year_performance": 8, "allowable_variance": 0,
        "description": "Automation of enterprise operations in: HR, Audit, Finance, Procurement, Admin, M&E, Programs and IT departments.",
    },
    {
        "name": "Employee Satisfaction Index (Work Environment, Rewards, Safety)",
        "area": "Management", "unit": "%", "weight": 2,
        "target": 65, "prev_year_performance": 62, "allowable_variance": 10,
        "description": (
            "External consultant to conduct employee satisfaction survey covering: "
            "i) Work environment (infrastructure, industrial relations); "
            "ii) Rewards and recognition (long service awards, bonuses, compensation, medical insurance); "
            "iii) Safety measures (compliance to NSSA regulations)."
        ),
    },
    {
        "name": "Research and Development (Number of scientific abstracts published)",
        "area": "Management", "unit": "Number", "weight": 1,
        "target": 20, "prev_year_performance": 5, "allowable_variance": 1,
        "description": "The organisation has targeted to publish 20 scientific papers/abstracts during the year.",
    },
    {
        "name": "Statutory obligations",
        "area": "Management", "unit": "%", "weight": 1,
        "target": 100, "prev_year_performance": 100, "allowable_variance": 0,
        "description": "Compliance with statutory obligations including ZIMRA and NSSA requirements.",
    },
    {
        "name": "Maintenance of buildings (Quarterly admin reports)",
        "area": "Management", "unit": "Number", "weight": 1,
        "target": 4, "prev_year_performance": 4, "allowable_variance": 0,
        "description": "Construction of offices, renovations and maintenance of hygienic standards. Quarterly administration reports produced.",
    },
    {
        "name": "Disposal of idle assets",
        "area": "Management", "unit": "Number", "weight": 1,
        "target": 1, "prev_year_performance": 1, "allowable_variance": 10,
        "description": "The organisation will auction obsolete assets during the year as per guiding policies and principles.",
    },

    # ── CROSS-CUTTING ─────────────────────────────────────────────────────────
    {
        "name": "Promotion of Integrity/Corruption Eradication",
        "area": "Cross-Cutting", "unit": "%", "weight": 1,
        "target": 100, "prev_year_performance": 100, "allowable_variance": 0,
        "description": (
            "The organisation is committed to eradicating corruption. Measures in place: "
            "Whistle blowing policy and Declaration of interest."
        ),
    },
    {
        "name": "Promotion of Wellness programmes (One half day after every 2 weeks)",
        "area": "Cross-Cutting", "unit": "%", "weight": 0.5,
        "target": 100, "prev_year_performance": 100, "allowable_variance": 0,
        "description": "One half-day wellness session set aside after every two weeks for employees. All work stations expected to conduct sessions and submit a report.",
    },
    {
        "name": "Inclusive Programming e.g. Youth, Disability and Gender mainstreaming",
        "area": "Cross-Cutting", "unit": "%", "weight": 1,
        "target": 100, "prev_year_performance": 100, "allowable_variance": 5,
        "description": (
            "Gender mainstreaming: gender policy available, all NAC indicators disaggregated by gender, gender budget in place. "
            "Inclusive programming for youth and persons with disabilities."
        ),
    },
    {
        "name": "Promotion of a Clean Environment (Number of days)",
        "area": "Cross-Cutting", "unit": "%", "weight": 0.5,
        "target": 100, "prev_year_performance": 100, "allowable_variance": 5,
        "description": (
            "Cleaning of offices and vicinities, fumigation, and participation in the National Clean Up Campaigns."
        ),
    },
]


def seed_kpis(apps, schema_editor):
    KpiDefinition = apps.get_model("kpis", "KpiDefinition")
    KpiDefinition.objects.all().delete()
    KpiDefinition.objects.bulk_create([KpiDefinition(**k) for k in KPIS])


def unseed_kpis(apps, schema_editor):
    apps.get_model("kpis", "KpiDefinition").objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ("kpis", "0003_kpidefinition_description_weight_float"),
    ]

    operations = [
        migrations.RunPython(seed_kpis, unseed_kpis),
    ]
