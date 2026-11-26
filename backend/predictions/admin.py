
from django.contrib import admin
from .models import Prediction


@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):

    list_display = (
        'transaction',
        'prediction_result',
        'formatted_risk_score',
        'model_name',
        'created_at'
    )

    list_filter = ('prediction_result', 'model_name')

    search_fields = (
        'transaction__transaction_id',
        'transaction__user__username',
    )

    @admin.display(description='Risk score', ordering='risk_score')
    def formatted_risk_score(self, obj):
        return f"{obj.risk_score:.4f}"
