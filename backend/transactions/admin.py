
from django.contrib import admin
from .models import Transaction


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):

    list_display = (
        'transaction_id',
        'display_user',
        'amount',
        'transaction_date',
        'is_fraud'
    )

    search_fields = ('transaction_id', 'user__username')

    list_filter = (
    'is_fraud',
    'user',
    'transaction_date',
)

    @admin.display(description='User', ordering='user__username')
    def display_user(self, obj):
        return obj.user.username if obj.user else 'Unassigned'
