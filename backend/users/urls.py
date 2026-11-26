
from django.urls import path

from .views import (
    RegisterAPIView,
    LoginAPIView,
    CurrentUserAPIView,
    LogoutAPIView,
    ProfileAPIView,
    ChangePasswordAPIView,
    AdminDashboardStatsAPIView,
    AdminUserListAPIView
)

urlpatterns = [
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('login/', LoginAPIView.as_view(), name='login'),
    path('me/', CurrentUserAPIView.as_view(), name='current-user'),
    path('logout/', LogoutAPIView.as_view(), name='logout'),
    path('profile/', ProfileAPIView.as_view(), name='profile'),
    path('change-password/', ChangePasswordAPIView.as_view(), name='change-password'),

    path(
        'admin-dashboard/',
        AdminDashboardStatsAPIView.as_view(),
        name='admin-dashboard'
    ),

    path(
        'admin-users/',
        AdminUserListAPIView.as_view(),
        name='admin-users'
    ),
]
