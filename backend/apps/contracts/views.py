from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Contract
from .serializers import ContractSerializer
from apps.accounts.permissions import IsAdmin, IsAnyAuthenticated


class ContractListCreateView(generics.ListCreateAPIView):
    serializer_class = ContractSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAuthenticated()]
        return [IsAdmin()]

    def get_queryset(self):
        user = self.request.user
        qs   = Contract.objects.select_related("entity")
        if user.role == "entity" and user.entity:
            return qs.filter(entity=user.entity)
        return qs


class ContractDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = ContractSerializer
    permission_classes = [IsAdmin]
    queryset           = Contract.objects.select_related("entity")
