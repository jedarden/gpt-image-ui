# API Reference

This document provides detailed information about the backend API endpoints for the GPT Image UI application. It includes request and response formats, authentication requirements, and error handling.

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Chat Endpoints](#chat-endpoints)
- [Image Endpoints](#image-endpoints)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## Base URL

All API endpoints are prefixed with the base path configured in the environment variables (default: `/api`).

- Development: `http://localhost:3001/api`
- Production: `{your-domain}/api`

## Authentication

The API uses token-based authentication. Include the authentication token in the request headers:

```
Authorization: Bearer {token}
```

### Authentication Endpoints

#### POST /auth/login

Authenticates a user and creates a session.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "username": "string"
  }
}
```

**Status Codes:**
- 200: Success
- 401: Invalid credentials
- 500: Server error

#### POST /auth/logout

Ends the current user session.

**Request Headers:**
- Authorization: Bearer {token}

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 500: Server error

#### GET /auth/status

Checks the current authentication status.

**Request Headers:**
- Authorization: Bearer {token}

**Response:**
```json
{
  "authenticated": true,
  "user": {
    "id": "string",
    "username": "string"
  }
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 500: Server error

## Chat Endpoints

### GET /chat/history

Retrieves the chat history.

**Request Headers:**
- Authorization: Bearer {token}

**Query Parameters:**
- limit: number (default: 50) - Maximum number of messages to return
- offset: number (default: 0) - Number of messages to skip

**Response:**
```json
{
  "messages": [
    {
      "id": "string",
      "role": "user | assistant",
      "content": "string",
      "timestamp": "string",
      "images": [
        {
          "id": "string",
          "url": "string"
        }
      ]
    }
  ],
  "total": "number"
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 500: Server error

### POST /chat/message

Sends a new message to the chat.

**Request Headers:**
- Authorization: Bearer {token}

**Request Body:**
```json
{
  "content": "string",
  "images": [
    {
      "base64": "string"
    }
  ]
}
```

**Response:**
```json
{
  "userMessage": {
    "id": "string",
    "role": "user",
    "content": "string",
    "timestamp": "string",
    "status": "COMPLETED"
  },
  "assistantMessage": {
    "id": "string",
    "role": "assistant",
    "content": "string",
    "timestamp": "string"
  }
}
```

**Status Codes:**
- 200: Success
- 400: Invalid request
- 401: Unauthorized
- 500: Server error

### DELETE /chat/history

Clears the chat history.

**Request Headers:**
- Authorization: Bearer {token}

**Response:**
```json
{
  "message": "Chat history cleared successfully"
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 500: Server error

## Image Endpoints

### POST /images/upload

Uploads an image and converts it to base64.

**Request Headers:**
- Authorization: Bearer {token}
- Content-Type: multipart/form-data

**Request Body:**
- Form data with 'image' field containing the image file

**Response:**
```json
{
  "id": "string",
  "base64": "string",
  "filename": "string",
  "size": "number",
  "type": "string",
  "timestamp": "string"
}
```

**Status Codes:**
- 200: Success
- 400: Invalid request
- 401: Unauthorized
- 500: Server error

### POST /images/generate

Generates images using the gpt-image-1 model.

**Request Headers:**
- Authorization: Bearer {token}

**Request Body:**
```json
{
  "prompt": "string",
  "n": "number",
  "size": "string",
  "quality": "string",
  "background": "string"
}
```

**Parameters:**
- prompt: Text description of the image to generate
- n: Number of images to generate (default: 1)
- size: Image size (default: "1024x1024", options: "256x256", "512x512", "1024x1024", "1792x1024", "1024x1792")
- quality: Image quality (default: "auto", options: "auto", "standard", "hd")
- background: Background handling (default: "auto", options: "auto", "white", "transparent")

**Response:**
```json
{
  "images": [
    {
      "id": "string",
      "base64": "string",
      "timestamp": "string"
    }
  ],
  "usage": {
    "total_tokens": "number",
    "input_tokens": "number",
    "output_tokens": "number"
  }
}
```

**Status Codes:**
- 200: Success
- 400: Invalid request
- 401: Unauthorized
- 500: Server error

### POST /images/edit

Edits images using the gpt-image-1 model.

**Request Headers:**
- Authorization: Bearer {token}

**Request Body:**
```json
{
  "image": "string",
  "prompt": "string",
  "mask": "string",
  "n": "number",
  "size": "string",
  "quality": "string"
}
```

**Parameters:**
- image: Base64 encoded image or image ID
- prompt: Text description of the edit to make
- mask: Base64 encoded mask image (white areas will be edited, black areas preserved)
- n: Number of images to generate (default: 1)
- size: Image size (default: "1024x1024")
- quality: Image quality (default: "auto", options: "auto", "standard", "hd")

**Response:**
```json
{
  "images": [
    {
      "id": "string",
      "base64": "string",
      "timestamp": "string"
    }
  ],
  "usage": {
    "total_tokens": "number",
    "input_tokens": "number",
    "output_tokens": "number"
  }
}
```

**Status Codes:**
- 200: Success
- 400: Invalid request
- 401: Unauthorized
- 500: Server error

### GET /images/:id

Retrieves an image by ID.

**Request Headers:**
- Authorization: Bearer {token}

**Path Parameters:**
- id: The ID of the image to retrieve

**Response:**
- The image file

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 404: Image not found
- 500: Server error

## Error Handling

The API returns appropriate HTTP status codes and error messages in a consistent format:

```json
{
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE"
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `API_KEY_MISSING` | OpenAI API key is not configured |
| `VALIDATION_ERROR` | Invalid request parameters |
| `IMAGE_PROCESSING_ERROR` | Error processing image |
| `OPENAI_ERROR` | Error from OpenAI API |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `IMAGE_NOT_FOUND` | Requested image not found |
| `UNAUTHORIZED` | Authentication required or invalid |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `SERVER_ERROR` | Internal server error |

### HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - The request was successful |
| 400 | Bad Request - Invalid request parameters |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server-side error |

## Rate Limiting

The API implements rate limiting to prevent abuse. The default configuration is:

- Window: 60,000 ms (1 minute)
- Max Requests: 100 per window

When the rate limit is exceeded, the API returns a 429 Too Many Requests status code with the following response:

```json
{
  "error": {
    "message": "Too many requests, please try again later",
    "code": "RATE_LIMIT_EXCEEDED"
  }
}
```

The response includes the following headers:
- `X-RateLimit-Limit`: Maximum number of requests allowed per window
- `X-RateLimit-Remaining`: Number of requests remaining in the current window
- `X-RateLimit-Reset`: Time (in seconds) until the rate limit resets

Rate limits can be configured using environment variables:
- `RATE_LIMIT_WINDOW_MS`: Rate limiting window in milliseconds
- `RATE_LIMIT_MAX_REQUESTS`: Maximum requests per window