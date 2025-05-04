#!/bin/bash
# Deployment script for GPT Image UI

set -e

# Configuration
APP_NAME="gpt-image-ui"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"

# Print colored output
print_info() {
  echo -e "\e[34m[INFO]\e[0m $1"
}

print_success() {
  echo -e "\e[32m[SUCCESS]\e[0m $1"
}

print_error() {
  echo -e "\e[31m[ERROR]\e[0m $1"
}

print_warning() {
  echo -e "\e[33m[WARNING]\e[0m $1"
}

# Check if .env.production exists
if [ ! -f "$ENV_FILE" ]; then
  print_error "Environment file $ENV_FILE not found!"
  print_info "Creating $ENV_FILE from .env.example..."
  cp .env.example "$ENV_FILE"
  print_warning "Please edit $ENV_FILE with your production settings before continuing."
  exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
  print_error "Docker is not installed. Please install Docker before continuing."
  exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
  print_error "Docker Compose is not installed. Please install Docker Compose before continuing."
  exit 1
fi

# Create SSL directory if it doesn't exist
if [ ! -d "ssl" ]; then
  print_info "Creating SSL directory..."
  mkdir -p ssl
  print_warning "Please place your SSL certificates in the ssl directory:"
  print_warning "  - ssl/cert.pem: SSL certificate"
  print_warning "  - ssl/key.pem: SSL private key"
fi

# Pull latest changes if in a git repository
if [ -d ".git" ]; then
  print_info "Pulling latest changes from git repository..."
  git pull
fi

# Build and start the application
print_info "Building and starting the application..."
docker-compose -f "$DOCKER_COMPOSE_FILE" build --no-cache
docker-compose -f "$DOCKER_COMPOSE_FILE" up -d

# Check if the application is running
print_info "Checking if the application is running..."
sleep 10
if docker-compose -f "$DOCKER_COMPOSE_FILE" ps | grep -q "Up"; then
  print_success "Application is running!"
  
  # Get the container IP
  CONTAINER_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "${APP_NAME}-nginx")
  
  print_info "Application is accessible at:"
  print_info "  - http://localhost (if running locally)"
  print_info "  - https://localhost (if running locally with SSL)"
  print_info "  - http://$CONTAINER_IP (internal network)"
  
  print_info "To view logs:"
  print_info "  docker-compose -f $DOCKER_COMPOSE_FILE logs -f"
else
  print_error "Application failed to start. Check logs for details:"
  print_error "  docker-compose -f $DOCKER_COMPOSE_FILE logs"
  exit 1
fi