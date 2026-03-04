"""
Data migration: convert all users with role='ceo' to role='entity'.
The CEO role has been removed from the system — the CEO's office now
submits performance reports as a regular entity.
"""
from django.db import migrations


def migrate_ceo_to_entity(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    updated = User.objects.filter(role="ceo").update(role="entity")
    if updated:
        print(f"\n  Migrated {updated} CEO user(s) to 'entity' role.")


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0002_alter_user_role"),
    ]

    operations = [
        migrations.RunPython(migrate_ceo_to_entity, migrations.RunPython.noop),
    ]
