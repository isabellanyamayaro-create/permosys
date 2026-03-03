from django.urls import path
from .views import EntityListCreateView, EntityDetailView

urlpatterns = [
    path("",          EntityListCreateView.as_view(), name="entity_list"),
    path("<int:pk>/", EntityDetailView.as_view(),     name="entity_detail"),
]
