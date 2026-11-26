from rest_framework import serializers
from .models import Transaction


class TransactionSerializer(serializers.ModelSerializer):

    analysis_status = serializers.SerializerMethodField()
    risk_level = serializers.SerializerMethodField()
    risk_reasons = serializers.SerializerMethodField()
    risk_score = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = [
            'user',
            'is_fraud',
            'analysis_status',
            'risk_level',
            'risk_reasons',
            'risk_score'
        ]

    def get_analysis_status(self, obj):
        if obj.predictions.exists():
            return 'Completed'
        return 'Pending Analysis'

    def get_risk_level(self, obj):
        prediction = obj.predictions.order_by('-created_at').first()

        if prediction and prediction.model_name == 'Rule-Based Risk Assessment':
            return prediction.prediction_result

        return None

    def get_risk_reasons(self, obj):
        prediction = obj.predictions.order_by('-created_at').first()

        if prediction and prediction.model_name == 'Rule-Based Risk Assessment':
            return prediction.risk_reasons

        return []
    def get_risk_score(self, obj):
        prediction = obj.predictions.order_by('-created_at').first()

        if prediction and prediction.model_name == 'Rule-Based Risk Assessment':
            return prediction.risk_score

        return None
        