
from django.urls import path
from .views import (
    TransactionListCreateAPIView,
    TransactionDetailAPIView
)

urlpatterns = [
    path(
        '',
        TransactionListCreateAPIView.as_view(),
        name='transaction-list-create'
    ),
    path(
        '<str:transaction_id>/',
        TransactionDetailAPIView.as_view(),
        name='transaction-detail'
    ),
]
