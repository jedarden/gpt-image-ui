# Installation and Setup

This guide provides detailed instructions for installing and configuring the GPT Image UI application.

## Prerequisites

Before installing the application, ensure you have the following prerequisites:

- **Node.js**: Version 18.0.0 or higher
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation with `node --version`

- **npm**: Usually comes with Node.js
  - Verify installation with `npm --version`

- **OpenAI API Key**: You need an API key with access to the gpt-image-1 model
  - Sign up at [OpenAI](https://openai.com/)
  - Create an API key in your account dashboard
  - Ensure your account has access to the gpt-image-1 model

- **Git**: For cloning the repository (optional)
  - Download from [git-scm.com](https://git-scm.com/)
  - Verify installation with `git --version`

## Installation Steps

Follow these steps to install the GPT Image UI application:

### 1. Clone the Repository

```bash
git clone <repository-url>
cd gpt-image-ui
```

Replace `<repository-url>` with the actual URL of the repository.

Alternatively, you can download the source code as a ZIP file and extract it.

### 2. Install Backend Dependencies

From the root directory of the project, run:

```bash
npm install
```

This will install all the required dependencies for the backend server.

### 3. Install Frontend Dependencies

From the root directory, run:

```bash
npm run client:install
```

This command will navigate to the client directory and install all the required dependencies for the React frontend.

### 4. Configure Environment Variables

Create a `.env` file in the root directory by copying the example file:

```bash
cp .env.example .env
```

Then, open the `.env` file in a text editor and update the values:

```
# Server Configuration
PORT=3001
BASE_PATH=/api
NODE_ENV=development
SUB_PATH=

# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_API_MODEL=gpt-image-1

# Security Configuration
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Browser Storage Configuration
STORAGE_LIMIT_CHAT=5
STORAGE_LIMIT_IMAGES=20
STORAGE_LIMIT_TOTAL=50
```

Be sure to replace `your_openai_api_key_here` with your actual OpenAI API key.

## Environment Configuration

The application can be configured using the following environment variables:

### Server Configuration

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `PORT` | The port on which the server will run | `3001` |
| `BASE_PATH` | The base path for the API endpoints | `/api` |
| `NODE_ENV` | The environment (development, production, test) | `development` |
| `SUB_PATH` | The subpath where the application is hosted (for subpath deployment) | `` (empty string for root deployment) |

### OpenAI API Configuration

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `OPENAI_API_KEY` | Your OpenAI API key | None (Required) |
| `OPENAI_API_MODEL` | The OpenAI model to use | `gpt-image-1` |

### Security Configuration

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `CORS_ORIGIN` | Allowed origins for CORS | `http://localhost:3000` |
| `RATE_LIMIT_WINDOW_MS` | Rate limiting window in milliseconds | `60000` (1 minute) |
| `RATE_LIMIT_MAX_REQUESTS` | Maximum requests per window | `100` |

### Browser Storage Configuration

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `STORAGE_LIMIT_CHAT` | Maximum storage for chat history (in MB) | `5` |
| `STORAGE_LIMIT_IMAGES` | Maximum storage for images (in MB) | `20` |
| `STORAGE_LIMIT_TOTAL` | Maximum total storage (in MB) | `50` |

## Running the Application

The application can be run in different modes depending on your needs.

### Development Mode

#### Running Backend Only

To start the backend server with automatic restart on file changes:

```bash
npm run dev
```

The server will start on the port specified in your `.env` file (default: 3001).

#### Running Frontend Only

To start the React development server:

```bash
npm run client:dev
```

The frontend will start on port 3000 and will proxy API requests to the backend server.

#### Running Full Stack

To start both the backend and frontend development servers concurrently:

```bash
npm run dev:full
```

This will start both servers and allow you to work on the full application.

### Production Mode

For production deployment, you need to build the frontend and then start the server in production mode.

#### Building the Frontend

```bash
npm run build
```

This command will:
1. Install frontend dependencies if not already installed
2. Build the React application for production
3. Output the build files to the `client/build` directory

#### Starting in Production Mode

```bash
npm run prod
```

This will start the server in production mode, which will serve the built frontend files and the API endpoints.

## Verifying Installation

After starting the application, you can verify that it's working correctly:

1. Open your browser and navigate to:
   - Frontend: `http://localhost:3000` (in development mode)
   - Backend API: `http://localhost:3001/api` (should return a 404 as there's no root endpoint)

2. Check the API health endpoint:
   - `http://localhost:3001/api/health` (if implemented)

3. Check the console output for any error messages.

## Troubleshooting

### Common Issues

#### "OpenAI API key not configured"
- Ensure you've added your OpenAI API key to the `.env` file
- Restart the server after updating the `.env` file

#### "CORS error in browser console"
- Check that the `CORS_ORIGIN` in your `.env` file matches the origin of your frontend
- For development, it should be `http://localhost:3000`

#### "Cannot connect to server"
- Verify the server is running on the expected port
- Check for any error messages in the server console
- Ensure no other application is using the same port

#### "Module not found" errors
- Run `npm install` in both the root directory and the client directory
- Check that all dependencies are correctly installed

#### "Permission denied" when running scripts
- Ensure you have the necessary permissions to run the scripts
- Try running with administrator/sudo privileges if necessary

## Next Steps

After successfully installing and configuring the application, you can:

- Explore the [User Guide](3_user_guide.md) to learn how to use the application
- Check the [API Reference](4_api_reference.md) for details on the backend API
- Review the [Developer Guide](5_developer_guide.md) if you plan to modify or extend the application