# GPT Image UI

A full-stack application for interacting with OpenAI's gpt-image-1 model, featuring a React frontend and Express backend.

## Features

- Chat interface with support for text and image inputs
- Image upload, generation, and editing capabilities
- Masking tool for inpainting (editing specific parts of images)
- Responsive UI with dark mode support
- Browser-based storage for chat history and images
- Export/import functionality for data backup
- Subpath deployment support (e.g., example.com/imagegen)
- No authentication required - just deploy and use
- Secure API key management using environment variables
- Comprehensive error handling and logging
- Rate limiting and security measures

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key with access to gpt-image-1 model

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd gpt-image-ui
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   npm run client:install
   ```

4. Create a `.env` file based on the `.env.example` file:
   ```bash
   cp .env.example .env
   ```

5. Edit the `.env` file and add your OpenAI API key and other configuration options.

## Configuration

The following environment variables can be configured in the `.env` file:

- `PORT`: The port on which the server will run (default: 3001)
- `BASE_PATH`: The base path for the API endpoints (default: /api)
- `NODE_ENV`: The environment (development, production, test)
- `SUB_PATH`: The subpath where the application is hosted (default: empty for root deployment)
- `OPENAI_API_KEY`: Your OpenAI API key
- `OPENAI_API_MODEL`: The OpenAI model to use (default: gpt-image-1)
- `CORS_ORIGIN`: Allowed origins for CORS (default: http://localhost:3000 in development)
- `RATE_LIMIT_WINDOW_MS`: Rate limiting window in milliseconds (default: 60000)
- `RATE_LIMIT_MAX_REQUESTS`: Maximum requests per window (default: 100)
- `STORAGE_LIMIT_CHAT`: Maximum storage for chat history in MB (default: 5)
- `STORAGE_LIMIT_IMAGES`: Maximum storage for images in MB (default: 20)
- `STORAGE_LIMIT_TOTAL`: Maximum total storage in MB (default: 50)

## Running the Application

### Development Mode (Backend Only)

```bash
npm run dev
```

This will start the backend server with nodemon, which will automatically restart the server when changes are detected.

### Development Mode (Frontend Only)

```bash
npm run client:dev
```

This will start the React development server.

### Development Mode (Full Stack)

```bash
npm run dev:full
```

This will start both the backend and frontend development servers concurrently.

### Production Mode

First, build the frontend:

```bash
npm run build
```

Then start the server in production mode:

```bash
npm run prod
```

This will serve the React frontend from the backend server.

## Deployment

The application can be deployed in several ways, including at a specific subpath. For detailed deployment instructions, see [Deployment Guide](docs/6_deployment_guide.md) and [Subpath Deployment Guide](docs/subpath_deployment_guide.md).

### Docker Deployment

The application includes Docker configuration for easy deployment:

1. Build the Docker image:
   ```bash
   npm run docker:build
   ```

2. Run the container:
   ```bash
   npm run docker:run
   ```

### Docker Compose Deployment

For production deployment with Nginx:

1. Create a `.env.production` file based on the example:
   ```bash
   cp .env.production.example .env.production
   ```

2. Edit the `.env.production` file with your production settings.

3. Start the application:
   ```bash
   npm run docker:compose:prod
   ```

4. To stop the application:
   ```bash
   npm run docker:compose:down
   ```

### Container Image

The application can be built and published as a container image to GitHub Packages using GitHub Actions. This provides a secure, versioned, and easily deployable artifact.

- **Automated Builds**: Container images are automatically built and published on pushes to main and release tags
- **Security Features**: Includes vulnerability scanning, SBOM generation, image signing, and non-root user execution
- **Versioned Images**: Images are tagged based on git tags and commits for reliable versioning

To pull and run the container image:

```bash
# Pull the latest version
docker pull ghcr.io/your-username/gpt-image-ui:latest

# Run the container
docker run -d \
  -p 3001:3001 \
  -e OPENAI_API_KEY=your_openai_api_key \
  -e PORT=3001 \
  -e CSP_DIRECTIVES="default-src 'self'; connect-src 'self' https://api.openai.com;" \
  -e CORS_ALLOWED_ORIGINS="https://example.com" \
  ghcr.io/your-username/gpt-image-ui:latest
```

For detailed information about the container workflow, security features, and customization options, see [Container Workflow Guide](docs/container-workflow-guide.md).

### Automated Deployment

Use the deployment script for a guided deployment process:

```bash
npm run deploy
```

### CI/CD Pipeline

The application includes GitHub Actions workflows for continuous integration and deployment. See `.github/workflows/ci-cd.yml` for details.

## Security

### Security Audit

Run the security audit script to check for common security issues:

```bash
npm run security:audit
```

### NPM Vulnerability Check

Check for vulnerabilities in npm packages:

```bash
npm run security:npm
```

## Browser Storage

The application uses browser localStorage to store chat history and image metadata. This eliminates the need for user accounts while still providing data persistence between sessions.

### Storage Features

- Chat history and image metadata stored locally in the browser
- Export/import functionality for data backup and transfer
- Storage management interface to monitor and control usage
- Automatic cleanup to prevent exceeding browser storage limits

### Storage Limitations

- Data is stored only in the current browser on the current device
- localStorage is typically limited to 5-10MB per domain
- Clearing browser data will erase all user information

## Monitoring

### Logs

View application logs:

```bash
npm run logs:view
```

View error logs:

```bash
npm run logs:error
```

### Health Check

The application provides a health check endpoint at `/api/health` that returns detailed information about the application's status.

## API Endpoints

### Chat

- `POST /api/chat/message`: Send a text prompt to the model
  - Request body:
    ```json
    {
      "content": "Describe this image",
      "images": [
        {
          "base64": "base64_encoded_image_data"
        }
      ]
    }
    ```
  - Response:
    ```json
    {
      "userMessage": {
        "id": "msg_1234567890",
        "role": "user",
        "content": "Describe this image",
        "timestamp": "2025-05-03T22:00:00.000Z",
        "status": "COMPLETED"
      },
      "assistantMessage": {
        "id": "msg_0987654321",
        "role": "assistant",
        "content": "The model's response",
        "timestamp": "2025-05-03T22:00:00.000Z"
      }
    }
    ```

- `GET /api/chat/history`: Get chat history
- `DELETE /api/chat/history`: Clear chat history

### Images

- `POST /api/images/upload`: Upload an image and convert to base64
  - Request: Form data with 'image' field containing the image file
  - Response:
    ```json
    {
      "id": "img_1234567890",
      "base64": "base64_encoded_image_data",
      "filename": "example.jpg",
      "size": 1024,
      "type": "image/jpeg",
      "timestamp": "2025-05-03T22:00:00.000Z"
    }
    ```

- `POST /api/images/generate`: Generate images using the gpt-image-1 model
  - Request body:
    ```json
    {
      "prompt": "A cute baby sea otter",
      "n": 1,
      "size": "1024x1024",
      "quality": "auto",
      "background": "auto"
    }
    ```
  - Response:
    ```json
    {
      "images": [
        {
          "id": "img_1234567890",
          "base64": "base64_encoded_image_data",
          "timestamp": "2025-05-03T22:00:00.000Z"
        }
      ],
      "usage": {
        "total_tokens": 100,
        "input_tokens": 50,
        "output_tokens": 50
      }
    }
    ```

- `POST /api/images/edit`: Edit images using the gpt-image-1 model
  - Request body:
    ```json
    {
      "image": "base64_encoded_image_data",
      "prompt": "Add a hat",
      "mask": "base64_encoded_mask_data",
      "n": 1,
      "size": "1024x1024",
      "quality": "auto"
    }
    ```
  - Response:
    ```json
    {
      "images": [
        {
          "id": "img_1234567890",
          "base64": "base64_encoded_image_data",
          "timestamp": "2025-05-03T22:00:00.000Z"
        }
      ],
      "usage": {
        "total_tokens": 100,
        "input_tokens": 50,
        "output_tokens": 50
      }
    }
    ```

- `GET /api/images/:id`: Get an image by ID

## Error Handling

The API returns appropriate HTTP status codes and error messages in the following format:

```json
{
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE"
  }
}
```

Common error codes:
- `API_KEY_MISSING`: OpenAI API key is not configured
- `VALIDATION_ERROR`: Invalid request parameters
- `IMAGE_PROCESSING_ERROR`: Error processing image
- `OPENAI_ERROR`: Error from OpenAI API
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `IMAGE_NOT_FOUND`: Requested image not found

## License

MIT
