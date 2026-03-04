from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("kpis", "0002_kpidefinition_allowable_variance_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="kpidefinition",
            name="name",
            field=models.CharField(max_length=300),
        ),
        migrations.AlterField(
            model_name="kpidefinition",
            name="weight",
            field=models.FloatField(help_text="Weighting for this KPI (supports 0.5)"),
        ),
        migrations.AddField(
            model_name="kpidefinition",
            name="description",
            field=models.TextField(
                blank=True,
                default="",
                help_text="Addendum explanation shown as tooltip on submission form",
            ),
        ),
    ]
