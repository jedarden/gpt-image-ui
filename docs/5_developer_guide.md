# Developer Guide

This guide provides detailed information for developers working on the GPT Image UI application. It covers the project structure, component architecture, state management, and guidelines for adding new features.

## Table of Contents

- [Project Structure](#project-structure)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [State Management](#state-management)
- [Adding New Features](#adding-new-features)
- [Testing Approach](#testing-approach)
- [Code Style and Best Practices](#code-style-and-best-practices)

## Project Structure

The GPT Image UI application is organized as a full-stack JavaScript application with a React frontend and Node.js/Express backend.

```
gpt-image-ui/
├── client/                 # Frontend React application
│   ├── public/             # Static assets
│   ├── src/                # React source code
│   │   ├── components/     # UI components
│   │   ├── contexts/       # React context providers
│   │   ├── utils/          # Utility functions
│   │   ├── App.js          # Root component
│   │   └── index.js        # Entry point
│   ├── package.json        # Frontend dependencies
│   └── README.md           # Frontend documentation
├── src/                    # Backend Node.js application
│   ├── config/             # Configuration files
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Express middleware
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   └── index.js            # Entry point
├── tests/                  # Test files
│   ├── e2e/                # End-to-end tests
│   └── unit/               # Unit tests
├── .env.example            # Example environment variables
├── package.json            # Backend dependencies
└── README.md               # Project documentation
```

## Frontend Architecture

The frontend is built with React and follows a component-based architecture.

### Component Hierarchy

```
App
├── Header
├── MainLayout
│   ├── ChatContainer
│   │   └── MessageList
│   │       └── MessageItem
│   │           ├── TextMessage
│   │           └── ImageMessage
│   └── ControlPanel
│       ├── PromptForm
│       └── ImageUploader
├── ImageViewerModal
├── MaskingModal
└── Footer
```

### Key Components

#### App
The root component that manages routing and global state. It provides context providers for authentication, chat, images, and UI state.

#### MainLayout
The primary layout component that organizes the chat interface and control panel. It handles responsive layout adjustments.

#### ChatContainer
Manages the display of chat messages and handles scrolling behavior.

#### MessageList
Renders the list of messages in the chat history, potentially with virtualization for performance.

#### MessageItem
Base component for rendering individual messages, which delegates to specialized components based on message type.

#### ControlPanel
Contains the input controls for sending messages and uploading images.

#### ImageViewerModal
Modal component for viewing images in full screen with navigation controls.

#### MaskingModal
Modal component for creating and editing image masks for inpainting.

### Frontend File Structure

```
client/src/
├── components/             # UI components
│   ├── ChatContainer.js
│   ├── ControlPanel.js
│   ├── Footer.js
│   ├── Header.js
│   ├── ImageMaskingModal.js
│   ├── ImageMessage.js
│   ├── ImageUpload.js
│   ├── ImageViewerModal.js
│   ├── MainLayout.js
│   ├── MessageInput.js
│   ├── MessageItem.js
│   ├── MessageList.js
│   ├── TextMessage.js
│   └── __tests__/          # Component tests
├── contexts/               # React context providers
│   ├── AuthContext.js
│   ├── ChatContext.js
│   ├── ImageContext.js
│   ├── UIContext.js
│   └── __tests__/          # Context tests
├── utils/                  # Utility functions
│   ├── api.js              # API client
│   ├── imageUtils.js       # Image processing utilities
│   └── __tests__/          # Utility tests
├── App.css                 # Global styles
├── App.js                  # Root component
├── index.css               # Base styles
└── index.js                # Entry point
```

## Backend Architecture

The backend follows a layered architecture with clear separation of concerns.

### Architectural Layers

```
Routes → Controllers → Services → External APIs/Data Storage
```

- **Routes**: Define API endpoints and route requests to controllers
- **Controllers**: Handle HTTP requests and responses
- **Services**: Implement business logic
- **External APIs/Data Storage**: Interact with external services and data stores

### Key Components

#### Routes
Define the API endpoints and map them to controller methods.

#### Controllers
Process incoming requests, call appropriate services, and format responses.

#### Services
Implement the core business logic, including interactions with the OpenAI API.

#### Middleware
Handle cross-cutting concerns like authentication, logging, and error handling.

### Backend File Structure

```
src/
├── config/                 # Configuration files
│   ├── index.js            # Configuration loader
│   ├── openai.js           # OpenAI API configuration
│   ├── security.js         # Security configuration
│   └── server.js           # Server configuration
├── controllers/            # Request handlers
│   ├── chat-controller.js
│   ├── image-controller.js
│   ├── index.js
│   └── __tests__/          # Controller tests
├── middleware/             # Express middleware
│   ├── error-handler.js
│   ├── index.js
│   ├── rate-limiter.js
│   ├── request-logger.js
│   ├── validate-api-key.js
│   └── __tests__/          # Middleware tests
├── routes/                 # API routes
│   ├── chat-routes.js
│   ├── image-routes.js
│   ├── index.js
│   └── __tests__/          # Route tests
├── services/               # Business logic
│   ├── chat-service.js
│   ├── image-service.js
│   ├── index.js
│   ├── openai-service.js
│   └── __tests__/          # Service tests
├── utils/                  # Utility functions
│   ├── error.js            # Error handling utilities
│   ├── image-processor.js  # Image processing utilities
│   ├── index.js
│   ├── validators.js       # Input validation utilities
│   └── __tests__/          # Utility tests
└── index.js                # Entry point
```

## State Management

The application uses React Context API for state management.

### Context Providers

#### AuthContext
Manages authentication state, including user information and login/logout functionality.

```javascript
// Example usage
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  // Use authentication state and functions
}
```

#### ChatContext
Manages chat messages and conversation state.

```javascript
// Example usage
import { useChat } from '../contexts/ChatContext';

function MyComponent() {
  const { messages, sendMessage, clearHistory } = useChat();
  
  // Use chat state and functions
}
```

#### ImageContext
Manages uploaded and generated images.

```javascript
// Example usage
import { useImages } from '../contexts/ImageContext';

function MyComponent() {
  const { images, uploadImage, generateImage, editImage } = useImages();
  
  // Use image state and functions
}
```

#### UIContext
Manages UI state like modal visibility and theme settings.

```javascript
// Example usage
import { useUI } from '../contexts/UIContext';

function MyComponent() {
  const { theme, setTheme, openModal, closeModal } = useUI();
  
  // Use UI state and functions
}
```

### State Flow

1. **User Interaction**: User interacts with a component
2. **Context Action**: Component calls a function from the appropriate context
3. **API Request**: Context makes an API request if needed
4. **State Update**: Context updates its state based on the response
5. **Component Re-render**: Components using the context re-render with the new state

## Adding New Features

Follow these guidelines when adding new features to the application.

### Frontend Features

1. **Plan the UI Components**:
   - Identify which existing components will be affected
   - Design new components if needed
   - Consider the user experience and flow

2. **Update or Create Components**:
   - Create new component files in the appropriate directories
   - Follow the existing component patterns
   - Include CSS files for styling

3. **Update State Management**:
   - Add new state variables to the appropriate context
   - Create new actions/functions for managing the state
   - Update context providers as needed

4. **Connect to Backend**:
   - Add new API client functions in `utils/api.js`
   - Handle loading states and errors appropriately

5. **Add Tests**:
   - Write unit tests for new components and functions
   - Update existing tests if behavior has changed

### Backend Features

1. **Plan the API Endpoints**:
   - Design the endpoint URL, method, and parameters
   - Define the request and response formats
   - Consider security and validation requirements

2. **Add Routes**:
   - Create or update route files in the `routes` directory
   - Map endpoints to controller methods

3. **Implement Controllers**:
   - Create or update controller files in the `controllers` directory
   - Handle request validation and response formatting

4. **Implement Services**:
   - Create or update service files in the `services` directory
   - Implement the business logic
   - Handle interactions with external APIs or data storage

5. **Add Tests**:
   - Write unit tests for new functionality
   - Add integration tests for API endpoints

### Prompt Analysis Feature

The application uses gpt-4.1-nano to analyze user prompts and determine optimal parameters for image generation. This section explains how this feature works and how to extend it.

#### Configuration

The prompt analysis model is configured in `src/config/openai.js`:

```javascript
// OpenAI API configuration
module.exports = {
  // ... other configuration
  promptAnalysisModel: process.env.OPENAI_PROMPT_ANALYSIS_MODEL || 'gpt-4.1-nano',
  // ... other configuration
};
```

#### Implementation

The feature is implemented in two main components:

1. **Prompt Analysis Function** (`src/services/openai-service.js`):
   - `analyzePromptForImageGeneration(prompt)`: Sends the user's prompt to gpt-4.1-nano and returns optimized parameters
   - Uses a carefully crafted system message to instruct the model on parameter selection
   - Validates returned parameters against allowed values
   - Falls back to defaults if analysis fails

2. **Integration in Image Service** (`src/services/image-service.js`):
   - Both `generateImages()` and `editImages()` functions check if parameters are explicitly provided
   - If parameters are missing, they call the prompt analysis function
   - The enhanced parameters are then used for the actual image generation

#### Extending the Feature

To extend the prompt analysis capabilities:

1. **Add New Parameters**:
   - Update the system message in `analyzePromptForImageGeneration()` to include instructions for the new parameter
   - Add validation for the new parameter
   - Update the return object to include the new parameter

2. **Modify Analysis Logic**:
   - Adjust the temperature setting to control randomness vs. determinism
   - Modify the system message to provide more specific guidance
   - Add examples in the system message for more consistent results

3. **Add Fallback Strategies**:
   - Implement more sophisticated fallback logic for when analysis fails
   - Consider caching successful analyses for similar prompts

### Example: Adding an Image Tagging Feature

#### Frontend Changes

1. Create a new component for displaying and managing tags:

```javascript
// client/src/components/ImageTags.js
import React from 'react';
import { useImages } from '../contexts/ImageContext';
import './ImageTags.css';

function ImageTags({ imageId }) {
  const { getImageTags, addImageTag, removeImageTag } = useImages();
  const tags = getImageTags(imageId);
  
  // Component implementation
}

export default ImageTags;
```

2. Update the ImageContext to support tags:

```javascript
// client/src/contexts/ImageContext.js
// Add to the context provider
const [imageTags, setImageTags] = useState({});

const getImageTags = (imageId) => imageTags[imageId] || [];

const addImageTag = async (imageId, tag) => {
  try {
    await api.addImageTag(imageId, tag);
    setImageTags(prev => ({
      ...prev,
      [imageId]: [...(prev[imageId] || []), tag]
    }));
  } catch (error) {
    console.error('Error adding tag:', error);
  }
};

// Include the new functions in the context value
```

3. Add API client functions:

```javascript
// client/src/utils/api.js
export const getImageTags = async (imageId) => {
  const response = await axios.get(`/api/images/${imageId}/tags`);
  return response.data;
};

export const addImageTag = async (imageId, tag) => {
  const response = await axios.post(`/api/images/${imageId}/tags`, { tag });
  return response.data;
};
```

#### Backend Changes

1. Add new routes:

```javascript
// src/routes/image-routes.js
router.get('/:id/tags', imageController.getImageTags);
router.post('/:id/tags', imageController.addImageTag);
router.delete('/:id/tags/:tag', imageController.removeImageTag);
```

2. Implement controller methods:

```javascript
// src/controllers/image-controller.js
exports.getImageTags = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tags = await imageService.getImageTags(id);
    res.json(tags);
  } catch (error) {
    next(error);
  }
};

exports.addImageTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tag } = req.body;
    const result = await imageService.addImageTag(id, tag);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
```

3. Implement service methods:

```javascript
// src/services/image-service.js
exports.getImageTags = async (imageId) => {
  // Implementation to retrieve tags from storage
};

exports.addImageTag = async (imageId, tag) => {
  // Implementation to add a tag to storage
};
```

## Testing Approach

The application uses Jest for testing both frontend and backend code.

### Frontend Testing

- **Component Tests**: Test individual React components
- **Context Tests**: Test context providers and hooks
- **Utility Tests**: Test utility functions

#### Example Component Test

```javascript
// client/src/components/__tests__/MessageItem.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import MessageItem from '../MessageItem';

describe('MessageItem', () => {
  it('renders a text message correctly', () => {
    const message = {
      id: '123',
      role: 'user',
      content: 'Hello, world!',
      timestamp: new Date().toISOString()
    };
    
    render(<MessageItem message={message} />);
    
    expect(screen.getByText('Hello, world!')).toBeInTheDocument();
  });
  
  // More tests...
});
```

### Backend Testing

- **Unit Tests**: Test individual functions and classes
- **Integration Tests**: Test API endpoints and service interactions
- **End-to-End Tests**: Test complete user flows

#### Example Controller Test

```javascript
// src/controllers/__tests__/chat-controller.test.js
const chatController = require('../chat-controller');
const chatService = require('../../services/chat-service');

jest.mock('../../services/chat-service');

describe('Chat Controller', () => {
  it('should return chat history', async () => {
    const mockMessages = [{ id: '123', content: 'Test message' }];
    chatService.getChatHistory.mockResolvedValue(mockMessages);
    
    const req = {};
    const res = {
      json: jest.fn()
    };
    const next = jest.fn();
    
    await chatController.getChatHistory(req, res, next);
    
    expect(res.json).toHaveBeenCalledWith(mockMessages);
  });
  
  // More tests...
});
```

### Running Tests

- Frontend tests: `npm run test:frontend`
- Backend unit tests: `npm run test:unit`
- Backend integration tests: `npm run test:integration`
- End-to-end tests: `npm run test:e2e`
- All tests: `npm test`

## Code Style and Best Practices

Follow these guidelines to maintain code quality and consistency.

### General Guidelines

- Use meaningful variable and function names
- Write comments for complex logic
- Keep functions small and focused
- Follow the DRY (Don't Repeat Yourself) principle
- Handle errors appropriately

### Frontend Guidelines

- Use functional components with hooks
- Keep components focused on a single responsibility
- Use prop types or TypeScript for type checking
- Follow React's best practices for performance
- Use CSS modules or styled components for styling

### Backend Guidelines

- Follow RESTful API design principles
- Validate all user inputs
- Use async/await for asynchronous code
- Implement proper error handling
- Use environment variables for configuration

### Commit Guidelines

- Write clear, descriptive commit messages
- Reference issue numbers when applicable
- Keep commits focused on a single change
- Test code before committing

By following these guidelines and understanding the project structure, you'll be well-equipped to contribute to the GPT Image UI application.