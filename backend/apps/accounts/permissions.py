from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Only system administrators."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "admin")


class IsEntity(BasePermission):
    """Only entity (ministry) users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "entity")


class IsMEConsultant(BasePermission):
    """Only M&E Consultants."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "me")


class IsMEOrAdmin(BasePermission):
    """M&E Consultants or Administrators — can approve/reject submissions."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and request.user.role in ("me", "admin")
        )


class IsEntityOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and request.user.role in ("entity", "admin")
        )


class IsAnyAuthenticated(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)
