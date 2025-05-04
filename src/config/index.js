/**
 * Main configuration file
 * Loads environment variables and exports configuration objects
 */

require('dotenv').config();

const server = require('./server');
const openai = require('./openai');
const security = require('./security');

module.exports = {
  server,
  openai,
  security
};