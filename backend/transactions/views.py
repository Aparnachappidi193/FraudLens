
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Transaction
from .serializers import TransactionSerializer


class TransactionListCreateAPIView(generics.ListCreateAPIView):

    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(
            user=self.request.user
        ).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TransactionDetailAPIView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    lookup_field = 'transaction_id'

    def get_queryset(self):
        return Transaction.objects.filter(
            user=self.request.user
        )

    def perform_update(self, serializer):
        transaction = self.get_object()

        serializer.save()

        # Remove the old assessment because transaction details changed.
        transaction.predictions.all().delete()
