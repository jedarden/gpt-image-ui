# GPT Image UI Testing Documentation

This document outlines the testing approach for the GPT Image UI application, covering both frontend and backend components.

## Testing Architecture

The testing architecture follows a comprehensive approach with multiple layers:

1. **Unit Tests**: Test individual components, functions, and utilities in isolation
2. **Integration Tests**: Test the interaction between multiple components
3. **End-to-End Tests**: Test the complete user flow from frontend to backend

## Test Directory Structure

```
gpt-image-ui/
├── src/
│   ├── __tests__/            # Backend unit tests
│   │   └── ...
│   ├── middleware/
│   │   ├── __tests__/        # Middleware unit tests
│   │   └── ...
│   ├── utils/
│   │   ├── __tests__/        # Utility unit tests
│   │   └── ...
│   └── tests/
│       ├── integration/      # Backend integration tests
│       └── ...
├── client/
│   └── src/
│       ├── components/
│       │   ├── __tests__/    # React component tests
│       │   └── ...
│       ├── contexts/
│       │   ├── __tests__/    # Context provider tests
│       │   └── ...
│       └── utils/
│           ├── __tests__/    # Frontend utility tests
│           └── ...
└── tests/                    # End-to-end tests
    └── ...
```

## Testing Tools

- **Jest**: Main testing framework for both frontend and backend
- **React Testing Library**: Testing React components
- **Supertest**: Testing HTTP endpoints
- **Mock Service Worker (MSW)**: Mocking API requests in frontend tests

## Running Tests

### Backend Tests

```bash
# Run all backend tests
cd gpt-image-ui
npm test

# Run specific test file
npm test -- src/middleware/__tests__/error-handler.test.js

# Run tests with coverage
npm test -- --coverage
```

### Frontend Tests

```bash
# Run all frontend tests
cd gpt-image-ui/client
npm test

# Run specific test file
npm test -- src/components/__tests__/ChatContainer.test.js

# Run tests with coverage
npm test -- --coverage
```

### End-to-End Tests

```bash
# Run end-to-end tests
cd gpt-image-ui
npm run test:e2e
```

## Test Coverage

The test suite aims to achieve at least 70% code coverage across the application. Coverage reports are generated when running tests with the `--coverage` flag.

## Backend Testing

### API Endpoints

- **Chat API**: Tests for sending messages, retrieving chat history, and handling errors
- **Image API**: Tests for image upload, generation, and editing

### Middleware

- **Error Handler**: Tests for proper error formatting and status codes
- **API Key Validation**: Tests for validating OpenAI API key
- **Rate Limiting**: Tests for request rate limiting

### Utilities

- **Validators**: Tests for input validation
- **Image Processor**: Tests for image file processing
- **Error Handling**: Tests for custom error classes

## Frontend Testing

### Components

- **ChatContainer**: Tests for rendering messages and handling user interactions
- **MessageItem**: Tests for rendering different message types
- **ImageMaskingModal**: Tests for image masking functionality

### Context Providers

- **ChatContext**: Tests for chat state management
- **ImageContext**: Tests for image state management
- **AuthContext**: Tests for authentication state

### Utilities

- **API Service**: Tests for API request handling
- **Image Utils**: Tests for client-side image processing

## Mocking Strategy

- **External APIs**: Mock OpenAI API responses
- **File System**: Mock file operations for image processing
- **Authentication**: Mock JWT validation and user sessions

## Test Data

Test data is provided through fixture files and in-line mock objects. Sensitive data like API keys are never included in tests.

## Continuous Integration

Tests are automatically run in the CI pipeline to ensure code quality before merging.

## Best Practices

1. **Isolation**: Each test should be independent and not rely on the state from other tests
2. **Mocking**: External dependencies should be mocked to ensure tests are reliable
3. **Coverage**: Aim for comprehensive coverage of both happy paths and error scenarios
4. **Readability**: Tests should be clear and descriptive, serving as documentation
5. **Maintenance**: Keep tests up to date with code changes