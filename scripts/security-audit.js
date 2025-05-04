#!/usr/bin/env node
/**
 * Security audit script for GPT Image UI
 * 
 * This script performs a basic security audit of the application,
 * checking for common security issues and providing recommendations.
 */

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

// Print header
console.log(`${colors.bold}${colors.blue}
╔═══════════════════════════════════════════════════╗
║                                                   ║
║        GPT Image UI Security Audit Tool           ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
${colors.reset}`);

// Initialize results
const results = {
  pass: [],
  warn: [],
  fail: [],
  info: []
};

// Helper functions
function addResult(type, message, details = '') {
  results[type].push({ message, details });
}

function printResults() {
  console.log(`\n${colors.bold}${colors.blue}=== Security Audit Results ===${colors.reset}\n`);
  
  console.log(`${colors.bold}${colors.green}✓ PASSED (${results.pass.length})${colors.reset}`);
  results.pass.forEach(({ message, details }) => {
    console.log(`  ${colors.green}✓${colors.reset} ${message}`);
    if (details) console.log(`    ${details}`);
  });
  
  console.log(`\n${colors.bold}${colors.yellow}⚠ WARNINGS (${results.warn.length})${colors.reset}`);
  results.warn.forEach(({ message, details }) => {
    console.log(`  ${colors.yellow}⚠${colors.reset} ${message}`);
    if (details) console.log(`    ${details}`);
  });
  
  console.log(`\n${colors.bold}${colors.red}✗ FAILURES (${results.fail.length})${colors.reset}`);
  results.fail.forEach(({ message, details }) => {
    console.log(`  ${colors.red}✗${colors.reset} ${message}`);
    if (details) console.log(`    ${details}`);
  });
  
  console.log(`\n${colors.bold}${colors.cyan}ℹ INFO (${results.info.length})${colors.reset}`);
  results.info.forEach(({ message, details }) => {
    console.log(`  ${colors.cyan}ℹ${colors.reset} ${message}`);
    if (details) console.log(`    ${details}`);
  });
  
  // Summary
  console.log(`\n${colors.bold}${colors.blue}=== Summary ===${colors.reset}`);
  console.log(`${colors.green}Passed: ${results.pass.length}${colors.reset}`);
  console.log(`${colors.yellow}Warnings: ${results.warn.length}${colors.reset}`);
  console.log(`${colors.red}Failures: ${results.fail.length}${colors.reset}`);
  console.log(`${colors.cyan}Info: ${results.info.length}${colors.reset}`);
  
  // Exit code based on failures
  if (results.fail.length > 0) {
    console.log(`\n${colors.red}${colors.bold}Security audit found ${results.fail.length} critical issues that need to be addressed.${colors.reset}`);
    process.exit(1);
  } else if (results.warn.length > 0) {
    console.log(`\n${colors.yellow}${colors.bold}Security audit found ${results.warn.length} warnings that should be reviewed.${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`\n${colors.green}${colors.bold}Security audit passed with no critical issues.${colors.reset}`);
    process.exit(0);
  }
}

// Run npm audit
function runNpmAudit() {
  console.log(`${colors.blue}Running npm audit...${colors.reset}`);
  
  try {
    const output = execSync('npm audit --json', { encoding: 'utf8' });
    const auditData = JSON.parse(output);
    
    if (auditData.vulnerabilities) {
      const { critical, high, moderate, low } = auditData.vulnerabilities;
      
      if (critical > 0) {
        addResult('fail', `Found ${critical} critical vulnerabilities`, 'Run npm audit fix to address these issues');
      } else {
        addResult('pass', 'No critical vulnerabilities found');
      }
      
      if (high > 0) {
        addResult('warn', `Found ${high} high severity vulnerabilities`, 'Run npm audit fix to address these issues');
      } else {
        addResult('pass', 'No high severity vulnerabilities found');
      }
      
      if (moderate > 0 || low > 0) {
        addResult('info', `Found ${moderate} moderate and ${low} low severity vulnerabilities`);
      }
    } else {
      addResult('pass', 'No vulnerabilities found in npm packages');
    }
  } catch (error) {
    try {
      const auditData = JSON.parse(error.stdout);
      const { critical, high, moderate, low } = auditData.metadata.vulnerabilities;
      
      if (critical > 0) {
        addResult('fail', `Found ${critical} critical vulnerabilities`, 'Run npm audit fix to address these issues');
      } else {
        addResult('pass', 'No critical vulnerabilities found');
      }
      
      if (high > 0) {
        addResult('warn', `Found ${high} high severity vulnerabilities`, 'Run npm audit fix to address these issues');
      } else {
        addResult('pass', 'No high severity vulnerabilities found');
      }
      
      if (moderate > 0 || low > 0) {
        addResult('info', `Found ${moderate} moderate and ${low} low severity vulnerabilities`);
      }
    } catch (parseError) {
      addResult('warn', 'Failed to parse npm audit results', error.message);
    }
  }
}

// Check for environment variables in code
function checkEnvironmentVariables() {
  console.log(`${colors.blue}Checking for hardcoded environment variables...${colors.reset}`);
  
  const apiKeyPattern = /['"](?:sk-|OPENAI_API_KEY=['"])([a-zA-Z0-9-_]{20,})['"]/g;
  const envPattern = /process\.env\.([A-Z_]+)/g;
  
  let foundApiKeys = false;
  let usedEnvVars = new Set();
  
  function searchInFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for API keys
    const apiKeyMatches = content.match(apiKeyPattern);
    if (apiKeyMatches) {
      foundApiKeys = true;
      addResult('fail', `Found potential API key in ${filePath}`, 'API keys should never be hardcoded');
    }
    
    // Collect used environment variables
    let match;
    while ((match = envPattern.exec(content)) !== null) {
      usedEnvVars.add(match[1]);
    }
  }
  
  function searchDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && file !== 'node_modules' && file !== '.git') {
        searchDirectory(filePath);
      } else if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.jsx'))) {
        searchInFile(filePath);
      }
    }
  }
  
  // Start search from src directory
  searchDirectory(path.join(__dirname, '../src'));
  
  if (!foundApiKeys) {
    addResult('pass', 'No hardcoded API keys found');
  }
  
  // Check if all used environment variables are documented
  const envExample = fs.readFileSync(path.join(__dirname, '../.env.example'), 'utf8');
  const envProduction = fs.readFileSync(path.join(__dirname, '../.env.production.example'), 'utf8');
  
  const documentedEnvVars = new Set();
  const envVarPattern = /^([A-Z_]+)=/gm;
  
  let match;
  while ((match = envVarPattern.exec(envExample)) !== null) {
    documentedEnvVars.add(match[1]);
  }
  
  while ((match = envVarPattern.exec(envProduction)) !== null) {
    documentedEnvVars.add(match[1]);
  }
  
  const undocumentedEnvVars = [...usedEnvVars].filter(v => !documentedEnvVars.has(v));
  
  if (undocumentedEnvVars.length > 0) {
    addResult('warn', 'Found undocumented environment variables', 
      `The following environment variables are used but not documented in .env.example or .env.production.example: ${undocumentedEnvVars.join(', ')}`);
  } else {
    addResult('pass', 'All used environment variables are properly documented');
  }
}

// Check security headers
function checkSecurityHeaders() {
  console.log(`${colors.blue}Checking security headers...${colors.reset}`);
  
  const securityConfigPath = path.join(__dirname, '../src/config/security.js');
  
  try {
    const content = fs.readFileSync(securityConfigPath, 'utf8');
    
    // Check for Content Security Policy
    if (content.includes('contentSecurityPolicy')) {
      addResult('pass', 'Content Security Policy is configured');
    } else {
      addResult('warn', 'Content Security Policy not found in security configuration');
    }
    
    // Check CORS configuration
    if (content.includes('cors')) {
      if (content.includes("origin: '*'") || content.includes("origin: \"*\"")) {
        addResult('warn', 'CORS is configured to allow all origins', 
          'Consider restricting CORS to specific origins in production');
      } else {
        addResult('pass', 'CORS is properly configured');
      }
    } else {
      addResult('warn', 'CORS configuration not found');
    }
    
    // Check for rate limiting
    if (content.includes('rateLimit')) {
      addResult('pass', 'Rate limiting is configured');
    } else {
      addResult('warn', 'Rate limiting configuration not found');
    }
  } catch (error) {
    addResult('warn', 'Could not read security configuration file', error.message);
  }
  
  // Check Nginx configuration
  const nginxConfigPath = path.join(__dirname, '../nginx.conf');
  
  try {
    const content = fs.readFileSync(nginxConfigPath, 'utf8');
    
    // Check for security headers
    const securityHeaders = [
      { name: 'X-Content-Type-Options', pattern: /X-Content-Type-Options/i },
      { name: 'X-XSS-Protection', pattern: /X-XSS-Protection/i },
      { name: 'X-Frame-Options', pattern: /X-Frame-Options/i },
      { name: 'Content-Security-Policy', pattern: /Content-Security-Policy/i },
      { name: 'Strict-Transport-Security', pattern: /Strict-Transport-Security/i },
      { name: 'Referrer-Policy', pattern: /Referrer-Policy/i }
    ];
    
    for (const header of securityHeaders) {
      if (header.pattern.test(content)) {
        addResult('pass', `${header.name} header is configured in Nginx`);
      } else {
        addResult('warn', `${header.name} header not found in Nginx configuration`);
      }
    }
    
    // Check for SSL configuration
    if (content.includes('ssl_certificate')) {
      addResult('pass', 'SSL is configured in Nginx');
    } else {
      addResult('warn', 'SSL configuration not found in Nginx');
    }
  } catch (error) {
    addResult('info', 'Could not read Nginx configuration file', error.message);
  }
}

// Check for proper error handling
function checkErrorHandling() {
  console.log(`${colors.blue}Checking error handling...${colors.reset}`);
  
  const errorHandlerPath = path.join(__dirname, '../src/middleware/error-handler.js');
  
  try {
    const content = fs.readFileSync(errorHandlerPath, 'utf8');
    
    // Check for stack trace exposure
    if (content.includes('process.env.NODE_ENV === \'development\'') && 
        content.includes('stack')) {
      addResult('pass', 'Error handler properly hides stack traces in production');
    } else if (content.includes('stack')) {
      addResult('warn', 'Error handler might expose stack traces in production');
    }
    
    // Check for error logging
    if (content.includes('logger.error')) {
      addResult('pass', 'Errors are properly logged');
    } else {
      addResult('warn', 'Error logging might be insufficient');
    }
  } catch (error) {
    addResult('warn', 'Could not read error handler file', error.message);
  }
}

// Check for input validation
function checkInputValidation() {
  console.log(`${colors.blue}Checking input validation...${colors.reset}`);
  
  const validatorsPath = path.join(__dirname, '../src/utils/validators.js');
  
  try {
    const content = fs.readFileSync(validatorsPath, 'utf8');
    
    // Check for validation functions
    const validationFunctions = content.match(/function\s+validate[A-Za-z]+/g);
    
    if (validationFunctions && validationFunctions.length > 0) {
      addResult('pass', `Found ${validationFunctions.length} validation functions`);
    } else {
      addResult('warn', 'No validation functions found');
    }
  } catch (error) {
    addResult('warn', 'Could not read validators file', error.message);
  }
  
  // Check if validation is used in routes
  const routesDir = path.join(__dirname, '../src/routes');
  let validationUsed = false;
  
  try {
    const files = fs.readdirSync(routesDir);
    
    for (const file of files) {
      if (file.endsWith('.js')) {
        const content = fs.readFileSync(path.join(routesDir, file), 'utf8');
        
        if (content.includes('validate') || content.includes('validator')) {
          validationUsed = true;
          break;
        }
      }
    }
    
    if (validationUsed) {
      addResult('pass', 'Input validation is used in routes');
    } else {
      addResult('warn', 'Input validation might not be used in routes');
    }
  } catch (error) {
    addResult('warn', 'Could not check routes for validation usage', error.message);
  }
}

// Run all checks
function runAllChecks() {
  runNpmAudit();
  checkEnvironmentVariables();
  checkSecurityHeaders();
  checkErrorHandling();
  checkInputValidation();
  
  // Print results
  printResults();
}

// Run the audit
runAllChecks();