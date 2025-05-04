# Subpath Deployment Guide

This guide explains how to deploy the GPT Image UI application at a subpath (e.g., example.com/imagegen) and details the changes made to support this deployment model.

## Overview of Changes

The application has been modified to:

1. Support deployment at a subpath
2. Remove login/authentication UI and logic
3. Implement browser-based storage for chat history and image metadata

## Deployment at a Subpath

### Configuration

The application now automatically detects when it's deployed at a subpath and adjusts its routing and API URLs accordingly. The detection logic is in `client/src/config.js`:

```javascript
// Get the base URL for the application
const getBaseUrl = () => {
  // Check if we're in a subpath deployment
  const pathname = window.location.pathname;
  const subpathMatch = pathname.match(/^\/([^/]+)/);
  
  // If we're in a subpath deployment, use that as the base URL
  if (subpathMatch && subpathMatch[1] !== 'api') {
    return `/${subpathMatch[1]}`;
  }
  
  // Otherwise, use the root
  return '';
};
```

### React Router Configuration

The React Router has been configured to use the detected basename:

```javascript
<BrowserRouter basename={config.baseUrl}>
  <App />
</BrowserRouter>
```

### API URL Handling

API URLs are now constructed relative to the detected base URL:

```javascript
// Get the API URL
const getApiUrl = () => {
  const baseUrl = process.env.REACT_APP_API_URL || '';
  
  // If API URL is explicitly set, use it
  if (baseUrl) {
    return baseUrl;
  }
  
  // Otherwise, construct it based on the current location
  const appBaseUrl = getBaseUrl();
  return `${appBaseUrl}/api`;
};
```

## Nginx Configuration for Subpath Deployment

To deploy the application at a subpath with Nginx, use a configuration like this:

```nginx
server {
    listen 80;
    server_name example.com;

    # Subpath configuration
    location /imagegen/ {
        alias /path/to/gpt-image-ui/client/build/;
        try_files $uri $uri/ /imagegen/index.html;
    }

    # API proxy for the subpath
    location /imagegen/api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Apache Configuration for Subpath Deployment

For Apache, use a configuration like this:

```apache
<VirtualHost *:80>
    ServerName example.com
    
    # Subpath configuration
    Alias "/imagegen" "/path/to/gpt-image-ui/client/build"
    <Directory "/path/to/gpt-image-ui/client/build">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Rewrite rule for SPA routing
        RewriteEngine On
        RewriteBase /imagegen/
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /imagegen/index.html [L]
    </Directory>
    
    # API proxy for the subpath
    ProxyPass "/imagegen/api" "http://localhost:3001/api"
    ProxyPassReverse "/imagegen/api" "http://localhost:3001/api"
</VirtualHost>
```

## Browser-Based Storage

The application now uses browser localStorage to store:

1. Chat messages
2. Uploaded image metadata
3. Generated image metadata
4. User settings

### Storage Limits

Default storage limits are set to:
- Chat messages: 5MB
- Images: 20MB
- Total storage: 50MB

These limits can be adjusted in the settings.

### Data Management

A new StorageManager component has been added to:
- Display current storage usage
- Export data to a JSON file
- Import data from a JSON file
- Clear stored data

## Building for Production

To build the application for production deployment at a subpath:

1. Set the homepage in `client/package.json`:

```json
{
  "name": "gpt-image-ui-client",
  "version": "1.0.0",
  "homepage": "/imagegen",
  ...
}
```

2. Build the client:

```bash
cd client
npm run build
```

3. Configure your server as described above.

## Environment Variables

For production deployment, you can set these environment variables:

- `REACT_APP_API_URL`: Override the API URL (optional)
- `REACT_APP_BASE_URL`: Override the base URL (optional)

## Troubleshooting

### Images Not Loading

If images aren't loading correctly when deployed at a subpath, check:

1. The API URL is correctly configured
2. The server is properly forwarding requests to the API
3. Image paths are correctly prefixed with the base URL

### Routing Issues

If you're experiencing routing issues:

1. Ensure the `basename` is correctly set in the React Router
2. Check that the server configuration correctly handles SPA routing
3. Verify that all links in the application use relative paths

### Storage Issues

If you're experiencing storage issues:

1. Check browser console for localStorage errors
2. Clear browser cache and reload
3. Check if localStorage is disabled in the browser
4. Verify that the browser supports localStorage