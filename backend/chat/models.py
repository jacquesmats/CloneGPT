import uuid
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Conversation(models.Model):
    """
    A conversation between a user and an AI assistant.
    
    This model represents a chat conversation that contains multiple messages.
    Each conversation belongs to a specific user and can have a title.
    
    Attributes:
        id (UUIDField): Unique identifier for the conversation
        user (ForeignKey): Reference to the User who owns this conversation
        title (CharField): Optional title for the conversation
        created_at (DateTimeField): When the conversation was created
        updated_at (DateTimeField): When the conversation was last updated
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations')
    title = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def generate_title(self, content):
        """
        Generate a title based on the first message content.
        
        Args:
            content (str): The content of the message to base the title on
            
        Returns:
            str: A generated title based on the content or a default title
        """
        if content and len(content) > 0:
            # Truncate to first 30 chars or first sentence
            title = content.split('.')[0][:30]
            return f"{title}..."
        return "New conversation"

    def __str__(self):
        """Return a string representation of the conversation."""
        return f"{self.title or 'Untitled'} - {self.user.username}"

    class Meta:
        """Meta options for the Conversation model."""
        ordering = ['-updated_at']


class Message(models.Model):
    """
    A message within a conversation.
    
    This model represents a single message in a conversation, which can be
    either from the user or the AI assistant.
    
    Attributes:
        id (UUIDField): Unique identifier for the message
        conversation (ForeignKey): Reference to the Conversation this message belongs to
        role (CharField): Either 'user' or 'assistant' indicating who sent the message
        content (TextField): The actual text content of the message
        created_at (DateTimeField): When the message was created
        model (CharField): Optional name of the AI model used for assistant messages
        temperature (FloatField): Optional temperature setting used for generating the message
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
    ]
    
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    model = models.CharField(max_length=50, null=True, blank=True)  
    temperature = models.FloatField(null=True, blank=True)
    
    def __str__(self):
        """Return a string representation of the message."""
        return f"{self.role}: {self.content[:50]}..."
    
    class Meta:
        """Meta options for the Message model."""
        ordering = ['created_at']