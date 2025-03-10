import os
import requests
from django.conf import settings

class LLMService:
    """Service for interacting with Azure OpenAI Language Models"""
    
    def __init__(self):
        self.api_key = os.environ.get('AZURE_OPENAI_API_KEY')
        self.base_url = os.environ.get('AZURE_OPENAI_ENDPOINT')
        self.api_version = os.environ.get('AZURE_OPENAI_API_VERSION', '2024-10-21')
        
    def generate_response(self, conversation_history, deployment):
        """
        Generate a response based on the conversation history using Azure OpenAI
        
        Args:
            conversation_history: List of message dicts with 'role' and 'content' keys
            
        Returns:
            str: The generated response text
        """
        try:
            # Construct the full API URL using the provided deployment
            api_url = f"{self.base_url}openai/deployments/{deployment}/chat/completions?api-version={self.api_version}"

            # Format the conversation history for the API
            messages = [
                {"role": msg["role"], "content": msg["content"]} 
                for msg in conversation_history
            ]
            
            # Azure OpenAI payload
            payload = {
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 500
            }
            
            # Azure OpenAI uses a different header for authentication
            headers = {
                "Content-Type": "application/json",
                "api-key": self.api_key
            }
            
            response = requests.post(
                api_url,
                headers=headers,
                json=payload
            )
            
            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"]
            else:
                # Log the error for debugging
                print(f"Error from Azure OpenAI API: {response.status_code}, {response.text}")
                return "I'm sorry, I encountered an error generating a response."
                
        except Exception as e:
            # Log the exception
            print(f"Exception in Azure OpenAI service: {str(e)}")
            return "I'm sorry, I encountered an unexpected error."

    def mock_response(self, user_message):
        """
        For testing without API calls, generate a mock response
        
        Args:
            user_message: The user's message
            
        Returns:
            str: A mock response
        """
        return f"This is a mock response to: '{user_message}'. In a production environment, this would be generated by Azure OpenAI."