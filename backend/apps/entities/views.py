from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Entity
from .serializers import EntitySerializer
from apps.accounts.permissions import IsAdmin


class EntityListCreateView(generics.ListCreateAPIView):
    queryset           = Entity.objects.all()
    serializer_class   = EntitySerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAuthenticated()]
        return [IsAdmin()]


class EntityDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = Entity.objects.all()
    serializer_class   = EntitySerializer
    permission_classes = [IsAdmin]
