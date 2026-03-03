from django.db import models


class Entity(models.Model):
    name       = models.CharField(max_length=200, unique=True)
    short_name = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table  = "pms_entities"
        ordering  = ["name"]
        verbose_name_plural = "entities"

    def __str__(self):
        return self.name

    @property
    def ceo_users(self):
        """Return all CEO users assigned to this entity."""
        return self.users.filter(role="ceo")
