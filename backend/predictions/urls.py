
from django.urls import path

from .views import (
    PredictionListCreateAPIView,
    FraudDetectionAPIView,
    ManualTransactionAnalysisAPIView
)

urlpatterns = [
    path(
        '',
        PredictionListCreateAPIView.as_view(),
        name='prediction-list-create'
    ),

    path(
        'detect/',
        FraudDetectionAPIView.as_view(),
        name='fraud-detection'
    ),

    path(
        'analyze-manual/',
        ManualTransactionAnalysisAPIView.as_view(),
        name='manual-transaction-analysis'
    ),
]
