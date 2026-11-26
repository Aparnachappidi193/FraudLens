
from django.db import models
from transactions.models import Transaction


class Prediction(models.Model):

    transaction = models.ForeignKey(
        Transaction,
        on_delete=models.CASCADE,
        related_name='predictions'
    )

    prediction_result = models.CharField(max_length=20)
    risk_score = models.FloatField()
    risk_reasons = models.JSONField(default=list, blank=True)
    model_name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction.transaction_id} - {self.prediction_result}"
