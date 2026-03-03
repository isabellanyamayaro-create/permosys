from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserRole(models.TextChoices):
    ME     = "me",     "M&E Consultant"
    CEO    = "ceo",    "Chief Executive Officer"
    ADMIN  = "admin",  "System Administrator"
    ENTITY = "entity", "Entity User"


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("role", UserRole.ADMIN)
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email    = models.EmailField(unique=True)
    name     = models.CharField(max_length=150)
    role     = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.ME)
    badge    = models.CharField(max_length=10, blank=True)
    initials = models.CharField(max_length=5, blank=True)
    label    = models.CharField(max_length=100, blank=True)

    # Link to entity — set for CEO and entity roles
    entity   = models.ForeignKey(
        "entities.Entity",
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name="users",
    )

    is_active = models.BooleanField(default=True)
    is_staff  = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD  = "email"
    REQUIRED_FIELDS = ["name"]

    class Meta:
        db_table = "pms_users"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.role})"
