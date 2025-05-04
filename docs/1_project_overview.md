# GPT Image UI: Project Overview

## Introduction

GPT Image UI is a full-stack application designed to provide an intuitive interface for interacting with OpenAI's gpt-image-1 model. The application enables users to engage in conversations with AI, upload images, generate new images from text prompts, and edit images using a masking tool for inpainting.

This application bridges the gap between powerful AI image generation capabilities and end users by providing a user-friendly interface with robust features for image manipulation and conversation. It's built with security, scalability, and user experience in mind.

## Key Features

### Chat Interface
- Text-based conversation with the AI model
- Support for including images in conversations
- Markdown rendering for formatted responses
- Conversation history management

### Image Capabilities
- **Image Upload**: Upload images from your device
- **Image Generation**: Create images from text prompts
- **Image Editing**: Modify existing images with text instructions
- **Inpainting**: Edit specific parts of images using a masking tool

### User Experience
- Responsive design that works on desktop and mobile devices
- Dark mode support for comfortable viewing
- Real-time feedback during image processing
- Intuitive image viewing and navigation

### Security
- Secure API key management
- Rate limiting to prevent abuse
- Input validation and sanitization
- Proper error handling and logging

## Technology Stack

### Frontend
- **React**: JavaScript library for building the user interface
- **Context API**: For state management across components
- **Axios**: For HTTP requests to the backend
- **React Markdown**: For rendering markdown in chat responses
- **Canvas API**: For the image masking functionality

### Backend
- **Node.js**: JavaScript runtime for the server
- **Express**: Web framework for handling HTTP requests
- **OpenAI API**: For accessing the gpt-image-1 model
- **Multer**: For handling file uploads
- **Winston/Morgan**: For logging

### Security
- **Helmet**: For setting HTTP security headers
- **CORS**: For controlling cross-origin requests
- **Express Rate Limit**: For rate limiting API requests
- **Environment Variables**: For secure configuration

### Development & Testing
- **Jest**: For unit and integration testing
- **Supertest**: For API testing
- **MSW (Mock Service Worker)**: For mocking API responses
- **Nodemon**: For automatic server restarts during development
- **Concurrently**: For running multiple scripts simultaneously

## Architecture Overview

The application follows a modular architecture with clear separation of concerns between frontend and backend components.

### System Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  React Frontend │◄────►│ Express Backend │◄────►│   OpenAI API    │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

### Frontend Architecture

The frontend is organized into the following key components:

- **App**: Root component that manages routing and global state
- **MainLayout**: Primary layout component for the application
- **ChatContainer**: Manages the chat interface and history
- **ControlPanel**: Contains input controls and tools
- **ImageMaskingModal**: Provides interface for creating masks
- **ImageViewerModal**: Displays images with navigation controls

State management is handled through React Context:

- **AuthContext**: Manages authentication state
- **ChatContext**: Manages chat messages and history
- **ImageContext**: Manages uploaded and generated images
- **UIContext**: Manages UI state like modal visibility

### Backend Architecture

The backend follows a layered architecture:

- **API Gateway**: Handles incoming requests, authentication, and routing
- **Controllers**: Process requests and coordinate responses
  - Chat Controller
  - Image Controller
- **Services**: Implement business logic
  - Chat Service
  - Image Service
  - OpenAI Service
- **Repositories**: Handle data storage and retrieval
- **Middleware**: Implement cross-cutting concerns
  - Authentication
  - Validation
  - Error Handling
  - Logging

### Data Flow

1. **User Interaction**: User interacts with the frontend UI
2. **Frontend Processing**: UI updates and API client prepares requests
3. **API Request**: Request is sent to the backend API
4. **Backend Processing**: Request is validated, processed, and forwarded to OpenAI if needed
5. **OpenAI Interaction**: Communication with OpenAI API for AI features
6. **Response Handling**: Response is processed and returned to frontend
7. **UI Update**: Frontend updates to display the results

## Next Steps

After reviewing this overview, you may want to explore:

- [Installation and Setup](2_installation_setup.md) for getting started with the application
- [User Guide](3_user_guide.md) for learning how to use the application
- [API Reference](4_api_reference.md) for details on the backend API
- [Developer Guide](5_developer_guide.md) for information on the codebase
- [Deployment Guide](6_deployment_guide.md) for deploying the application