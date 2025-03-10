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
    """Custom permission to only allow owners of an object to access it."""
    
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    llm_service = LLMService()
    
    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def add_message(self, request, pk=None):
        conversation = self.get_object()
        
        serializer = MessageSerializer(data=request.data)
        if serializer.is_valid():
            # Save the user message
            user_message = serializer.save(conversation=conversation)
            
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

            deployment = request.data.get('deployment', 'gpt-35-turbo')

            
            assistant_response = self.llm_service.generate_response(formatted_history, deployment)
            
            # Create the assistant message
            assistant_message = Message.objects.create(
                conversation=conversation,
                role='assistant',
                content=assistant_response
            )
            
            # Return both messages
            return Response({
                'user_message': serializer.data,
                'assistant_message': MessageSerializer(assistant_message).data
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class RegisterView(APIView):
    permission_classes = []
    
    def post(self, request):
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
    permission_classes = []
    
    def post(self, request):
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
    def post(self, request):
        # Delete the token to logout
        request.auth.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)