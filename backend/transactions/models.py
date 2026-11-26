
from django.db import models
from django.contrib.auth.models import User


class Transaction(models.Model):

    transaction_id = models.CharField(max_length=100, unique=True)

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='transactions'
    )

    amount = models.DecimalField(max_digits=12, decimal_places=2)

    transaction_date = models.DateTimeField()

    transaction_type = models.CharField(
        max_length=50,
        blank=True,
        default=''
    )

    merchant_name = models.CharField(
        max_length=150,
        blank=True,
        default=''
    )

    location = models.CharField(
        max_length=150,
        blank=True,
        default=''
    )

    description = models.TextField(blank=True, default='')

    is_fraud = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.transaction_id
