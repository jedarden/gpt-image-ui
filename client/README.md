# GPT Image UI Client

This is the frontend for the GPT Image UI application, a React-based SPA that allows users to interact with OpenAI's gpt-image-1 model.

## Features

- Chat interface with message history
- Image upload and preview
- Image generation using OpenAI's gpt-image-1 model
- Image editing with masking for inpainting
- Responsive design for different screen sizes

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Navigate to the client directory:
   ```
   cd gpt-image-ui/client
   ```
3. Install dependencies:
   ```
   npm install
   ```

### Development

To start the development server:

```
npm start
```

This will run the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### Building for Production

To build the app for production:

```
npm run build
```

This will create a `build` folder with the production-ready application.

## Project Structure

- `src/components/` - React components
- `src/contexts/` - React context providers
- `src/utils/` - Utility functions
- `src/App.js` - Main application component
- `src/index.js` - Application entry point

## API Integration

The client communicates with the backend API for:

- Chat message processing
- Image generation
- Image editing with inpainting
- User authentication

## Environment Variables

Create a `.env` file in the client directory with the following variables:

```
REACT_APP_API_URL=http://localhost:3001
```

## Dependencies

- React - UI library
- Axios - HTTP client
- React Markdown - Markdown rendering
- UUID - Generating unique IDs

## License

This project is licensed under the MIT License - see the LICENSE file for details.