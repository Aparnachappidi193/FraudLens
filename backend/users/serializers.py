
from django.contrib.auth.models import User
from rest_framework import serializers

from .models import UserProfile


class RegisterSerializer(serializers.ModelSerializer):

    phone_number = serializers.CharField(
        max_length=15,
        required=False,
        allow_blank=True
    )

    organization = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True
    )

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'password',
            'phone_number',
            'organization'
        ]

    def create(self, validated_data):
        phone_number = validated_data.pop('phone_number', '')
        organization = validated_data.pop('organization', '')

        password = validated_data.pop('password')

        user = User.objects.create_user(
            password=password,
            **validated_data
        )

        profile = user.profile
        profile.phone_number = phone_number
        profile.organization = organization
        profile.save()

        return user
class ProfileSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source='user.username',
        read_only=True
    )

    email = serializers.EmailField(
        source='user.email',
        read_only=True
    )

    class Meta:
        model = UserProfile
        fields = [
            'username',
            'email',
            'phone_number',
            'organization'
        ]