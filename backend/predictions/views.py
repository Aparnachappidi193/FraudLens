
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated

from django.utils import timezone
from django.db import transaction as db_transaction

from .models import Prediction
from .serializers import (
    PredictionSerializer,
    FraudPredictionInputSerializer,
    ManualTransactionAnalysisSerializer
)

from ml_model.predict import predict_transaction
from transactions.models import Transaction


class PredictionListCreateAPIView(generics.ListAPIView):

    serializer_class = PredictionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Prediction.objects.filter(
            transaction__user=self.request.user
        ).order_by('-created_at')


# Existing ML-based fraud detection API
class FraudDetectionAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = FraudPredictionInputSerializer(
            data=request.data
        )

        if serializer.is_valid():

            transaction_data = list(
                serializer.validated_data.values()
            )

            results = predict_transaction(transaction_data)

            fraud_detected = any(
                result["prediction"] == 1
                for result in results.values()
            )

            with db_transaction.atomic():

                new_transaction = Transaction.objects.create(
                    user=request.user,
                    transaction_id=f"FL-{timezone.now().strftime('%Y%m%d%H%M%S%f')}",
                    amount=serializer.validated_data["Amount"],
                    transaction_date=timezone.now(),
                    is_fraud=fraud_detected
                )

                for model_name, result in results.items():

                    Prediction.objects.create(
                        transaction=new_transaction,
                        prediction_result=(
                            "Fraud"
                            if result["prediction"] == 1
                            else "Legitimate"
                        ),
                        risk_score=result["fraud_probability"],
                        model_name=model_name
                    )

            return Response({
                "message": "Fraud prediction completed and saved successfully",
                "transaction_id": new_transaction.transaction_id,
                "predictions": results
            }, status=status.HTTP_200_OK)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# New rule-based risk assessment API for manual transactions
class ManualTransactionAnalysisAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = ManualTransactionAnalysisSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        transaction_id = serializer.validated_data['transaction_id']

        try:
            transaction = Transaction.objects.get(
                transaction_id=transaction_id,
                user=request.user
            )
        except Transaction.DoesNotExist:
            return Response(
                {'error': 'Transaction not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Prevent duplicate analysis records
        if transaction.predictions.exists():
            return Response(
                {'error': 'This transaction has already been analyzed.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Initial transparent rule-based risk assessment
        risk_score = 0
        risk_reasons = []

        if transaction.amount >= 50000:
            risk_score += 40
            risk_reasons.append('High transaction amount')

        elif transaction.amount >= 20000:
            risk_score += 20
            risk_reasons.append('Above-normal transaction amount')

        if transaction.transaction_type.lower() in [
            'other', 'cash'
        ]:
            risk_score += 10
            risk_reasons.append('Transaction type requires additional review')

        if not transaction.location.strip():
            risk_score += 10
            risk_reasons.append('Transaction location is missing')

        if not transaction.merchant_name.strip():
            risk_score += 10
            risk_reasons.append('Merchant information is missing')

        risk_score = min(risk_score, 100)

        if risk_score >= 50:
            risk_level = 'High'
        elif risk_score >= 25:
            risk_level = 'Medium'
        else:
            risk_level = 'Low'

        with db_transaction.atomic():

            prediction = Prediction.objects.create(
            transaction=transaction,
            prediction_result=risk_level,
            risk_score=risk_score / 100,
            risk_reasons=risk_reasons,
            model_name='Rule-Based Risk Assessment'
        )

            # This is a risk assessment, not a confirmed fraud verdict.
            transaction.is_fraud = False
            transaction.save(update_fields=['is_fraud'])

        return Response({
            'message': 'Transaction risk assessment completed.',
            'transaction_id': transaction.transaction_id,
            'risk_level': risk_level,
            'risk_score': risk_score,
            'risk_reasons': risk_reasons,
            'assessment_type': 'Rule-Based Risk Assessment',
            'prediction_id': prediction.id
        }, status=status.HTTP_200_OK)
