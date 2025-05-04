# Deployment Guide

This guide provides detailed instructions for deploying the GPT Image UI application to production environments. It covers building the application, deployment options, configuration, and security considerations.

## Table of Contents

- [Production Build Process](#production-build-process)
- [Deployment Options](#deployment-options)
- [Environment Configuration](#environment-configuration)
- [Subpath Deployment](#subpath-deployment)
- [Security Considerations](#security-considerations)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## Production Build Process

Follow these steps to prepare the application for production deployment:

### 1. Install Dependencies

Ensure all dependencies are installed for both the backend and frontend:

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
npm run client:install
```

### 2. Build the Frontend

Build the React frontend application:

```bash
npm run build
```

This command:
- Runs the React build process
- Creates optimized production files in the `client/build` directory
- Minifies JavaScript and CSS
- Generates asset manifests and source maps

### 3. Verify the Build

Check that the build was successful:
- Ensure the `client/build` directory exists and contains files
- Look for any error messages in the build output

### 4. Test the Production Build Locally

Test the production build locally before deploying:

```bash
# Set environment to production
export NODE_ENV=production

# Start the server
npm run prod
```

Access the application at `http://localhost:3001` (or your configured port) to verify it works correctly.

## Deployment Options

The GPT Image UI application can be deployed in several ways:

### Traditional Server Deployment

#### Prerequisites
- Node.js (v18 or higher) installed on the server
- Access to the server via SSH or similar
- Ability to run processes in the background (e.g., using PM2)

#### Deployment Steps

1. Transfer the application files to the server:
   ```bash
   # Using SCP (replace with your server details)
   scp -r gpt-image-ui user@server:/path/to/deployment
   ```

2. Install dependencies on the server:
   ```bash
   cd /path/to/deployment
   npm install --production
   ```

3. Set up environment variables (see [Environment Configuration](#environment-configuration)).

4. Use a process manager like PM2 to run the application:
   ```bash
   # Install PM2 if not already installed
   npm install -g pm2
   
   # Start the application
   pm2 start src/index.js --name "gpt-image-ui"
   
   # Ensure PM2 restarts the application on server reboot
   pm2 startup
   pm2 save
   ```

5. Set up a reverse proxy (Nginx or Apache) to forward requests to the Node.js application.

### Docker Deployment

#### Prerequisites
- Docker installed on the server
- Docker Compose (optional, for multi-container deployments)

#### Dockerfile

Create a `Dockerfile` in the project root:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build the frontend
RUN npm run build

# Expose the port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Start the application
CMD ["node", "src/index.js"]
```

#### Build and Run the Docker Image

```bash
# Build the Docker image
docker build -t gpt-image-ui .

# Run the container
docker run -d -p 3001:3001 --name gpt-image-ui \
  -e OPENAI_API_KEY=your_api_key \
  -e CORS_ORIGIN=https://your-domain.com \
  gpt-image-ui
```

### Cloud Platform Deployment

The application can be deployed to various cloud platforms:

#### Heroku

1. Create a `Procfile` in the project root:
   ```
   web: node src/index.js
   ```

2. Initialize a Git repository if not already done:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. Create a Heroku app and deploy:
   ```bash
   heroku create
   git push heroku main
   ```

4. Set environment variables:
   ```bash
   heroku config:set OPENAI_API_KEY=your_api_key
   heroku config:set NODE_ENV=production
   ```

#### AWS Elastic Beanstalk

1. Install the EB CLI:
   ```bash
   pip install awsebcli
   ```

2. Initialize EB application:
   ```bash
   eb init
   ```

3. Create an environment and deploy:
   ```bash
   eb create
   ```

4. Set environment variables through the AWS Console or EB CLI.

## Environment Configuration

Proper environment configuration is crucial for a secure and functional production deployment.

### Required Environment Variables

Create a `.env` file on your server or set environment variables through your deployment platform:

```
# Server Configuration
PORT=3001
BASE_PATH=/api
NODE_ENV=production
SUB_PATH=/imagegen

# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_API_MODEL=gpt-image-1

# Security Configuration
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Browser Storage Configuration
STORAGE_LIMIT_CHAT=5
STORAGE_LIMIT_IMAGES=20
STORAGE_LIMIT_TOTAL=50
```

### Environment Variable Descriptions

| Variable | Description | Production Recommendation |
|----------|-------------|---------------------------|
| `PORT` | The port on which the server will run | Use the port provided by your hosting platform or 80/443 |
| `BASE_PATH` | The base path for the API endpoints | `/api` or a custom path if needed |
| `SUB_PATH` | The subpath where the application is hosted | `/imagegen` or empty string for root deployment |
| `STORAGE_LIMIT_CHAT` | Maximum storage for chat history (in MB) | `5` |
| `STORAGE_LIMIT_IMAGES` | Maximum storage for images (in MB) | `20` |
| `STORAGE_LIMIT_TOTAL` | Maximum total storage (in MB) | `50` |
| `NODE_ENV` | The environment | Always set to `production` |
| `OPENAI_API_KEY` | Your OpenAI API key | Use a production API key with appropriate usage limits |
| `OPENAI_API_MODEL` | The OpenAI model to use | `gpt-image-1` |
| `CORS_ORIGIN` | Allowed origins for CORS | Your production domain (e.g., `https://your-domain.com`) |
| `RATE_LIMIT_WINDOW_MS` | Rate limiting window in milliseconds | `60000` (1 minute) or adjust based on expected traffic |
| `RATE_LIMIT_MAX_REQUESTS` | Maximum requests per window | `100` or adjust based on expected traffic |

### Securing Environment Variables

- Never commit `.env` files to source control
- Use your deployment platform's secrets management system when available
- Restrict access to environment variables to authorized personnel
- Rotate API keys periodically

## Subpath Deployment

The application now fully supports deployment at a subpath (e.g., `example.com/imagegen`), which is useful when hosting multiple applications on the same domain or when you can't deploy at the root path.

### Configuration Overview

To deploy the application at a subpath, you need to configure both the backend and frontend:

1. **Backend Configuration**: Set the `SUB_PATH` environment variable
2. **Frontend Configuration**: Set the `homepage` field in `client/package.json`
3. **Web Server Configuration**: Configure your web server to route requests correctly

### Backend Configuration

Set the `BASE_PATH` and `SUB_PATH` environment variables in your `.env` file:

```
BASE_PATH=/api
SUB_PATH=/imagegen
```

- `BASE_PATH` controls the API endpoint prefix (e.g., `/api`)
- `SUB_PATH` controls the application's base URL path (e.g., `/imagegen`)

With this configuration:
- The application will be accessible at `https://your-domain.com/imagegen/`
- API endpoints will be available at `https://your-domain.com/imagegen/api/`

### Frontend Configuration

The frontend automatically detects and adapts to subpath deployment through:

1. **Dynamic Base URL Detection**: The application detects when it's deployed at a subpath and adjusts routing accordingly:

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

2. **React Router Configuration**: The router uses the detected basename:

```javascript
<BrowserRouter basename={config.baseUrl}>
  <App />
</BrowserRouter>
```

3. **API URL Construction**: API URLs are built relative to the detected base URL:

```javascript
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

4. **Package.json Configuration**: For production builds, set the `homepage` field in `client/package.json`:

```json
{
  "name": "gpt-image-ui-client",
  "version": "1.0.0",
  "homepage": "/imagegen",
  ...
}
```

### Web Server Configuration

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Subpath configuration
    location /imagegen/ {
        alias /path/to/deployment/client/build/;
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

#### Apache Configuration

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    
    # Subpath configuration
    Alias "/imagegen" "/path/to/deployment/client/build"
    <Directory "/path/to/deployment/client/build">
        Options -Indexes +FollowSymLinks
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

### Environment Variables for Subpath Deployment

For production deployment with a subpath, you can set these environment variables:

- `SUB_PATH`: The subpath where the application is hosted (e.g., `/imagegen`)
- `REACT_APP_BASE_URL`: Override the base URL (optional, detected automatically)
- `REACT_APP_API_URL`: Override the API URL (optional, constructed automatically)

### Troubleshooting Subpath Deployment

If you encounter issues with subpath deployment:

1. **404 Errors**: Ensure your web server is correctly configured to handle client-side routing
2. **API Connection Issues**: Verify that API requests include the correct subpath
3. **Asset Loading Problems**: Check that all asset URLs are relative to the subpath
4. **Redirect Loops**: Make sure your rewrite rules are correctly configured

## Security Considerations

Implementing proper security measures is essential for protecting your application and user data.

### HTTPS

Always use HTTPS in production:
- Obtain an SSL certificate (e.g., using Let's Encrypt)
- Configure your web server to use HTTPS
- Redirect HTTP traffic to HTTPS

### API Key Security

Protect your OpenAI API key:
- Store it securely in environment variables
- Never expose it to the frontend
- Set up usage limits in your OpenAI account
- Rotate the key periodically

### Rate Limiting

Configure appropriate rate limits to prevent abuse:
- Adjust `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS` based on expected traffic
- Consider implementing more sophisticated rate limiting for different endpoints
- Set up IP-based rate limiting at the web server level

### CORS Configuration

Restrict cross-origin requests:
- Set `CORS_ORIGIN` to your production domain
- Use a whitelist approach for multiple domains
- Avoid using `*` in production

### Content Security Policy

Implement a Content Security Policy to prevent XSS attacks:
- Add appropriate headers in your web server configuration
- Restrict which domains can serve scripts, styles, and other resources

### Regular Updates

Keep dependencies up to date:
- Regularly run `npm audit` to check for vulnerabilities
- Update dependencies to patch security issues
- Subscribe to security advisories for critical dependencies

### Authentication Removal and Browser Storage

The application has been updated to remove authentication requirements and now uses browser-based storage:

1. **No Login Required**: Users can access the application without creating accounts or logging in
2. **Browser Storage**: All data (chat history, images, settings) is stored in the browser's localStorage
3. **Privacy Considerations**: Each user's data remains private to their browser/device
4. **Data Persistence**: Data persists between sessions but is limited to the current browser

### Public Access Considerations

Since this application no longer requires authentication:
- Consider implementing additional rate limiting or IP restrictions if needed
- Be aware that anyone with access to the URL can use the application
- Monitor usage closely to prevent abuse
- Consider implementing a simple API key system if you need to restrict access
- Use HTTPS to protect data in transit, even though no user accounts exist

### Browser Storage Limitations

When deploying the application, be aware of browser storage limitations:
- localStorage is typically limited to 5-10MB per domain
- The application manages storage limits to prevent exceeding browser capabilities
- Users can export/import data for backup or transfer between devices
- Clearing browser data will erase all user information

## Monitoring and Maintenance

Implement monitoring and maintenance procedures to ensure the application runs smoothly.

### Logging

Set up comprehensive logging:
- Use a logging service (e.g., Loggly, Papertrail)
- Log important events and errors
- Implement structured logging for easier analysis
- Set up log rotation to manage disk space

### Health Checks

Implement health check endpoints:
- Create a `/health` or `/status` endpoint
- Monitor the health of external dependencies
- Set up automated alerts for failures

### Backup Procedures

Establish backup procedures:
- Regularly backup any persistent data
- Test restoration procedures
- Automate backups when possible

### Performance Monitoring

Monitor application performance:
- Track response times and error rates
- Monitor resource usage (CPU, memory)
- Set up alerts for performance degradation

## Troubleshooting

Common issues and their solutions:

### Application Not Starting

**Symptoms:**
- Server fails to start
- Error messages in logs

**Solutions:**
- Check environment variables are correctly set
- Verify port is not in use by another application
- Check for syntax errors in code
- Ensure Node.js version is compatible

### API Errors

**Symptoms:**
- 500 errors from API endpoints
- OpenAI API errors

**Solutions:**
- Verify OpenAI API key is valid and has sufficient credits
- Check rate limits have not been exceeded
- Review server logs for specific error messages
- Ensure the OpenAI model specified is available to your account

### Frontend Not Loading

**Symptoms:**
- Blank page
- JavaScript errors in browser console

**Solutions:**
- Check that the frontend was built correctly
- Verify static files are being served correctly
- Check for CORS issues in browser console
- Ensure the BASE_PATH and PUBLIC_URL are configured correctly

### Performance Issues

**Symptoms:**
- Slow response times
- High CPU or memory usage

**Solutions:**
- Implement caching where appropriate
- Optimize database queries if applicable
- Consider scaling up server resources
- Implement pagination for large data sets

By following this deployment guide, you should be able to successfully deploy the GPT Image UI application to a production environment. Remember to regularly monitor the application and keep dependencies up to date to ensure security and performance.