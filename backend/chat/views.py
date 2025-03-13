from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Conversation, Message
from .serializers import UserSerializer, ConversationSerializer, MessageSerializer
from .services.llm_service import LLMService

from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate



class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to access it.
    
    This permission is used to ensure that users can only access their own
    conversations and messages.
    """
    
    def has_object_permission(self, request, view, obj):
        """
        Check if the requesting user is the owner of the object.
        
        Args:
            request: The HTTP request
            view: The view that the permission is being checked against
            obj: The object that the permission is being checked for
            
        Returns:
            bool: True if the user is the owner, False otherwise
        """
        return obj.user == request.user


class ConversationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing conversations.
    
    This viewset provides CRUD operations for conversations and includes
    a custom action for adding messages to a conversation.
    
    Permissions:
        - User must be authenticated
        - User must be the owner of the conversation
    """
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    llm_service = LLMService()
    
    def get_queryset(self):
        """
        Get the queryset of conversations for the current user.
        
        Returns:
            QuerySet: Filtered queryset containing only the user's conversations
        """
        return Conversation.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def add_message(self, request, pk=None):
        """
        Add a new message to a conversation and get an AI response.
        
        This action adds a user message to the conversation and then
        generates an AI assistant response using the LLM service.
        
        Args:
            request: The HTTP request containing the message data
            pk: The primary key of the conversation
            
        Returns:
            Response: The serialized message data or error response
        """
        conversation = self.get_object()
        
        # Extract model and temperature parameters
        model = request.data.get('model', 'gpt-4o-mini')
        temperature = request.data.get('temperature', 0.7)
        
        serializer = MessageSerializer(data=request.data)
        if serializer.is_valid():
            # Save the user message with model and temperature
            user_message = serializer.save(
                conversation=conversation,
                model=model,
                temperature=temperature
            )
            
            # Get conversation history for context
            conversation_history = Message.objects.filter(
                conversation=conversation
            ).order_by('created_at')
            
            # Format conversation history for the LLM
            formatted_history = [
                {
                    "role": msg.role,
                    "content": msg.content
                } for msg in conversation_history
            ]
            
            # Generate AI response using the LLM service
            llm_service = LLMService()
            assistant_response = llm_service.generate_response(formatted_history, model, temperature)
            
            # Create the assistant message with the same model and temperature values
            assistant_message = Message.objects.create(
                conversation=conversation,
                role='assistant',
                content=assistant_response,
                model=model,
                temperature=temperature
            )
            
            # Return both messages
            return Response({
                'user_message': MessageSerializer(user_message).data,
                'assistant_message': MessageSerializer(assistant_message).data
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing user information.
    
    This viewset provides read-only access to user data and includes
    a custom action for retrieving the current user's information.
    
    Permissions:
        - User must be authenticated
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        Retrieve the current user's information.
        
        Returns:
            Response: The serialized data for the current user
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class RegisterView(APIView):
    """
    API view for user registration.
    
    This view handles the creation of new user accounts and
    returns a token for authentication.
    
    Permissions:
        - No authentication required
    """
    permission_classes = []
    
    def post(self, request):
        """
        Register a new user.
        
        Args:
            request: The HTTP request containing the user data
            
        Returns:
            Response: The created user data and authentication token,
                     or error response
        """
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data.get('username')
            email = serializer.validated_data.get('email')
            password = request.data.get('password')
            
            if not password:
                return Response(
                    {'error': 'Password is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create the user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password
            )
            
            # Create token for the user
            token, _ = Token.objects.get_or_create(user=user)
            
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    API view for user login.
    
    This view handles user authentication and returns a token
    for subsequent API requests.
    
    Permissions:
        - No authentication required
    """
    permission_classes = []
    
    def post(self, request):
        """
        Authenticate a user and return a token.
        
        Args:
            request: The HTTP request containing the login credentials
            
        Returns:
            Response: The user data and authentication token,
                     or error response
        """
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'error': 'Please provide both username and password'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(username=username, password=password)
        
        if not user:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        token, _ = Token.objects.get_or_create(user=user)
        
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key
        })


class LogoutView(APIView):
    """
    API view for user logout.
    
    This view handles the deletion of the user's authentication token.
    
    Permissions:
        - User must be authenticated
    """
    def post(self, request):
        """
        Log out a user by deleting their authentication token.
        
        Args:
            request: The HTTP request
            
        Returns:
            Response: Empty response with 204 No Content status
        """
        # Delete the token to logout
        request.auth.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)