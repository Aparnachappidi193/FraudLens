from django.contrib import admin

# Register your models here.

from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone_number', 'organization', 'created_at')
    search_fields = ('user__username', 'organization')