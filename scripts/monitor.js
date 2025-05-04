#!/usr/bin/env node
/**
 * Monitoring script for GPT Image UI
 * 
 * This script checks the health of the application and reports any issues.
 * It can be run as a cron job to regularly monitor the application.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for output formatting
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Configuration
const config = {
  healthEndpoint: process.env.HEALTH_ENDPOINT || 'http://localhost:3001/api/health',
  logFile: process.env.LOG_FILE || path.join(__dirname, '../logs/monitor.log'),
  alertThresholds: {
    memory: {
      rss: 500 * 1024 * 1024, // 500 MB
      heapTotal: 300 * 1024 * 1024, // 300 MB
      heapUsed: 250 * 1024 * 1024 // 250 MB
    },
    uptime: 60 * 60 * 24 * 7 // 7 days (restart recommended)
  }
};

// Ensure logs directory exists
const logsDir = path.dirname(config.logFile);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Helper functions
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} [${level.toUpperCase()}] ${message}\n`;
  
  // Write to log file
  fs.appendFileSync(config.logFile, logEntry);
  
  // Print to console with color
  let color = colors.reset;
  switch (level) {
    case 'error':
      color = colors.red;
      break;
    case 'warn':
      color = colors.yellow;
      break;
    case 'info':
      color = colors.blue;
      break;
    case 'success':
      color = colors.green;
      break;
  }
  
  console.log(`${color}${timestamp} [${level.toUpperCase()}]${colors.reset} ${message}`);
}

// Check application health
async function checkHealth() {
  try {
    log('Starting health check');
    
    const response = await axios.get(config.healthEndpoint, { timeout: 5000 });
    const health = response.data;
    
    if (health.status === 'ok') {
      log('Application is healthy', 'success');
      
      // Check memory usage
      if (health.memory) {
        const { rss, heapTotal, heapUsed } = health.memory;
        
        if (rss > config.alertThresholds.memory.rss) {
          log(`High RSS memory usage: ${formatBytes(rss)}`, 'warn');
        }
        
        if (heapTotal > config.alertThresholds.memory.heapTotal) {
          log(`High heap allocation: ${formatBytes(heapTotal)}`, 'warn');
        }
        
        if (heapUsed > config.alertThresholds.memory.heapUsed) {
          log(`High heap usage: ${formatBytes(heapUsed)}`, 'warn');
        }
        
        log(`Memory usage: RSS=${formatBytes(rss)}, Heap=${formatBytes(heapUsed)}/${formatBytes(heapTotal)}`);
      }
      
      // Check uptime
      if (health.uptime) {
        const uptime = health.uptime;
        
        if (uptime > config.alertThresholds.uptime) {
          log(`Application has been running for ${formatDuration(uptime)}, consider restarting`, 'warn');
        } else {
          log(`Uptime: ${formatDuration(uptime)}`);
        }
      }
      
      // Check environment
      if (health.environment) {
        log(`Environment: ${health.environment}`);
      }
      
      // Check version
      if (health.version) {
        log(`Version: ${health.version}`);
      }
      
      // Check OpenAI configuration
      if (health.openai) {
        if (!health.openai.apiKeyConfigured) {
          log('OpenAI API key is not configured', 'error');
        } else {
          log(`OpenAI model: ${health.openai.model}`);
        }
      }
    } else {
      log(`Application health check failed: ${health.status}`, 'error');
    }
  } catch (error) {
    log(`Failed to connect to application: ${error.message}`, 'error');
    
    // Check if the application is running
    try {
      const processes = execSync('ps aux | grep "node src/index.js" | grep -v grep', { encoding: 'utf8' });
      log('Application process is running, but not responding to health checks', 'warn');
      log(`Process info: ${processes.trim()}`);
    } catch (psError) {
      log('Application process is not running', 'error');
    }
  }
}

// Format bytes to human-readable format
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Format duration to human-readable format
function formatDuration(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
}

// Run the health check
checkHealth().catch(error => {
  log(`Unexpected error: ${error.message}`, 'error');
  process.exit(1);
});