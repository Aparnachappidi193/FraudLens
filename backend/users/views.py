from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db.models import OuterRef, Subquery, Count

from transactions.models import Transaction
from predictions.models import Prediction

from rest_framework import generics, status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import RegisterSerializer, ProfileSerializer


class RegisterAPIView(generics.CreateAPIView):

    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class LoginAPIView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(
            username=username,
            password=password
        )

        if user is not None:

            token, created = Token.objects.get_or_create(user=user)

            return Response({
                'message': 'Login successful',
                'token': token.key,
                'user_id': user.id,
                'username': user.username,
                'is_staff': user.is_staff
            })

        return Response(
            {'error': 'Invalid username or password'},
            status=status.HTTP_400_BAD_REQUEST
        )


class CurrentUserAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user
        profile = getattr(user, 'profile', None)

        return Response({
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'phone_number': profile.phone_number if profile else '',
            'organization': profile.organization if profile else ''
        })


class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.auth.delete()

        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)

class ProfileAPIView(generics.RetrieveUpdateAPIView):

    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.profile

class ChangePasswordAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not old_password or not new_password:
            return Response(
                {'error': 'Both old and new passwords are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = request.user

        if not user.check_password(old_password):
            return Response(
                {'error': 'Current password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_password) < 8:
            return Response(
                {'error': 'New password must contain at least 8 characters'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()

        Token.objects.filter(user=user).delete()

        return Response({
            'message': 'Password changed successfully. Please log in again.'
        }, status=status.HTTP_200_OK)       


class AdminDashboardStatsAPIView(APIView):

    permission_classes = [IsAdminUser]

    def get(self, request):

        latest_predictions = Prediction.objects.filter(
            transaction=OuterRef('pk')
        ).order_by('-created_at')

        transactions = Transaction.objects.annotate(
            latest_result=Subquery(
                latest_predictions.values('prediction_result')[:1]
            ),
            latest_model=Subquery(
                latest_predictions.values('model_name')[:1]
            )
        )

        return Response({
            'total_users': User.objects.count(),

            'total_transactions': transactions.count(),

            'high_risk_transactions': transactions.filter(
                latest_model='Rule-Based Risk Assessment',
                latest_result='High'
            ).count(),

            'medium_risk_transactions': transactions.filter(
                latest_model='Rule-Based Risk Assessment',
                latest_result='Medium'
            ).count(),

            'low_risk_transactions': transactions.filter(
                latest_model='Rule-Based Risk Assessment',
                latest_result='Low'
            ).count(),

            'pending_analysis': transactions.filter(
                latest_model__isnull=True
            ).count()
        }, status=status.HTTP_200_OK)


class AdminUserListAPIView(APIView):

    permission_classes = [IsAdminUser]

    def get(self, request):

        users = User.objects.annotate(
            transaction_count=Count('transactions')
        ).order_by('-date_joined')

        user_data = []

        for user in users:
            user_data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'date_joined': user.date_joined,
                'is_active': user.is_active,
                'transaction_count': user.transaction_count
            })

        return Response(user_data, status=status.HTTP_200_OK)

