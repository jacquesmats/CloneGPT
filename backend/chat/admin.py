from django.contrib import admin
from .models import Conversation, Message
# Register your models here.

class MessageInline(admin.TabularInline):
    """
    Inline for messages in the admin interface
    """
    model = Message
    extra = 1

class MessageAdmin(admin.ModelAdmin):
    """
    Admin configuration for Message model
    """
    list_display = ('id', 'conversation', 'role', 'content_preview', 'model', 'temperature', 'created_at')
    list_filter = ('role', 'model', 'created_at', 'conversation')
    search_fields = ('content', 'model')
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    
    content_preview.short_description = 'Content Preview'

class ConversationAdmin(admin.ModelAdmin):
    """
    Admin configuration for Conversation model
    """
    inlines = [MessageInline]
    list_display = ('title', 'user', 'created_at', 'updated_at')
    list_filter = ('user',)
    search_fields = ('title', 'user__username')

admin.site.register(Conversation, ConversationAdmin)
admin.site.register(Message, MessageAdmin)
