# GPTClone

A full-stack chat application with a React/Next.js frontend and Django REST API backend, designed to provide a ChatGPT-like experience.

## Project Overview

GPTClone is a web application that allows users to:

- Register and login to their accounts
- Create and manage chat conversations
- Interact with an AI assistant powered by Azure OpenAI

### Tech Stack

**Frontend:**

- Next.js 15.2.1 (with React 18.3.1)
- Material UI 6.4.7
- TailwindCSS 4
- React Query for API data fetching
- TypeScript

**Backend:**

- Django 4.2.x
- Django REST Framework
- SQLite database (default)
- Token-based authentication

## Development Environment

This project uses VS Code DevContainers for a consistent development environment. The container includes:

- Python 3.11
- Node.js 20.x
- PostgreSQL client
- Required Python packages
- Required Node.js packages

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [VS Code Remote - Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### Setup Instructions

1. Clone the repository:

   ```bash
   git clone https://github.com/jacquesmats/CloneGPT.git
   cd GPTClone
   ```

2. Create a `.env` file in the root directory based on `.env.example`:

   ```bash
   cp .env.example .env
   ```

3. Add your Azure OpenAI credentials to the `.env` file:

   ```
   AZURE_OPENAI_API_KEY=your_api_key
   AZURE_OPENAI_ENDPOINT=your_endpoint
   AZURE_OPENAI_API_VERSION=your_api_version
   ```

4. Open the project in VS Code and reopen in container when prompted, or run:

   ```bash
   code .
   ```

   Then click on the notification to "Reopen in Container" or use the Command Palette (F1) and select "Remote-Containers: Reopen in Container".

5. The container will build and set up the environment automatically.

## Running the Application

### Backend (Django)

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Apply migrations (if not already done by the container setup):

   ```bash
   python manage.py migrate
   ```

3. Create a superuser (admin):

   ```bash
   python manage.py createsuperuser
   ```

4. Run the development server:
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```

The Django backend will be available at http://localhost:8000/

### Frontend (Next.js)

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies (if not already done):

   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

The Next.js frontend will be available at http://localhost:3000/

## API Endpoints

The backend provides the following REST API endpoints:

- **Authentication**:

  - `POST /api/auth/register/` - Register a new user
  - `POST /api/auth/login/` - Login and get authentication token
  - `POST /api/auth/logout/` - Logout and invalidate token
  - `POST /api-token-auth/` - Get authentication token

- **Conversations**:

  - `GET /api/conversations/` - List all conversations for the authenticated user
  - `POST /api/conversations/` - Create a new conversation
  - `GET /api/conversations/{id}/` - Get a specific conversation
  - `PUT /api/conversations/{id}/` - Update a conversation
  - `DELETE /api/conversations/{id}/` - Delete a conversation

- **Users**:
  - `GET /api/users/` - List all users (admin only)
  - `GET /api/users/{id}/` - Get user details

## Development Commands

### Django Commands

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test

# Run development server
python manage.py runserver 0.0.0.0:8000

# Django shell
python manage.py shell
```

### Next.js Commands

```bash
# Run development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## Ports

- **Frontend**: 3000
- **Backend**: 8000

## Project Structure

```
GPTClone/
├── .devcontainer/           # DevContainer configuration
├── backend/
│   ├── chat/                # Django app for chat functionality
│   │   ├── migrations/      # Database migrations
│   │   ├── services/        # Business logic services
│   │   ├── admin.py         # Admin panel configuration
│   │   ├── models.py        # Database models
│   │   ├── serializers.py   # API serializers
│   │   ├── urls.py          # URL routing
│   │   └── views.py         # API views
│   ├── chat_backend/        # Django project settings
│   │   ├── settings.py      # Project settings
│   │   ├── urls.py          # Main URL routing
│   │   ├── wsgi.py          # WSGI configuration
│   │   └── asgi.py          # ASGI configuration
│   ├── db.sqlite3           # SQLite database
│   └── manage.py            # Django management script
├── frontend/
│   ├── public/              # Static files
│   ├── src/
│   │   ├── app/             # Next.js app directory
│   │   ├── components/      # React components
│   │   ├── services/        # API services
│   │   └── utils/           # Utility functions
│   ├── package.json         # Node.js dependencies
│   └── tsconfig.json        # TypeScript configuration
├── .env                     # Environment variables
├── .env.example             # Example environment variables
├── requirements.txt         # Python dependencies
└── README.md                # This file
```

## Contributing

1. Create a feature branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:

   ```bash
   git commit -m "Add your feature description"
   ```

3. Push to the branch:

   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a pull request.

## License

[MIT License](LICENSE)
