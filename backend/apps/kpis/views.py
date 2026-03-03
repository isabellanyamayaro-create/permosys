from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import KpiDefinition
from .serializers import KpiDefinitionSerializer
from apps.accounts.permissions import IsAdmin


class KpiListCreateView(generics.ListCreateAPIView):
    queryset           = KpiDefinition.objects.all()
    serializer_class   = KpiDefinitionSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAuthenticated()]
        return [IsAdmin()]


class KpiDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = KpiDefinition.objects.all()
    serializer_class   = KpiDefinitionSerializer
    permission_classes = [IsAdmin]
