from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Conversation, Message

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model.
    
    This serializer handles the conversion between User model instances and JSON representations.
    It exposes only the id, username, and email fields for security reasons.
    
    Attributes:
        id (int): The user's unique identifier
        username (str): The user's username
        email (str): The user's email address
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email']
        read_only_fields = ['id']
        extra_kwargs = {
            'password': {'write_only': True}
        }

class MessageSerializer(serializers.ModelSerializer):
    """
    Serializer for the Message model.
    
    This serializer handles the conversion between Message model instances and JSON representations.
    It includes all relevant fields for a message in a conversation.
    
    Attributes:
        id (UUID): The message's unique identifier
        role (str): Either 'user' or 'assistant'
        content (str): The text content of the message
        created_at (datetime): When the message was created
        model (str): The AI model used for assistant messages
        temperature (float): The temperature setting used for generating the message
    """
    class Meta:
        model = Message
        fields = ['id', 'role', 'content', 'created_at', 'model', 'temperature']
        read_only_fields = ['id', 'created_at']


class ConversationSerializer(serializers.ModelSerializer):
    """
    Serializer for the Conversation model.
    
    This serializer handles the conversion between Conversation model instances and JSON representations.
    It includes a nested representation of all messages in the conversation.
    
    Attributes:
        id (UUID): The conversation's unique identifier
        title (str): The title of the conversation
        created_at (datetime): When the conversation was created
        updated_at (datetime): When the conversation was last updated
        messages (list): A list of all messages in the conversation
    """
    messages = MessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Conversation
        fields = ['id', 'title', 'created_at', 'updated_at', 'messages']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        """
        Create and return a new Conversation instance.
        
        This method automatically assigns the current user to the conversation.
        
        Args:
            validated_data (dict): The validated data for creating the conversation
            
        Returns:
            Conversation: The newly created conversation instance
        """
        # Assign the current user to the conversation
        user = self.context['request'].user
        conversation = Conversation.objects.create(user=user, **validated_data)
        return conversation