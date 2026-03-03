from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import MeView, change_password, logout_view

# Auth endpoints — used by include("apps.accounts.urls")
urlpatterns = [
    path("login/",              TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/",            TokenRefreshView.as_view(),    name="token_refresh"),
    path("logout/",             logout_view,                   name="logout"),
    path("me/",                 MeView.as_view(),              name="me"),
    path("me/change-password/", change_password,               name="change_password"),
]
