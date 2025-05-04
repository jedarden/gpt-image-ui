/**
 * Controllers index file
 * Exports all controller modules
 */

const chatController = require('./chat-controller');
const imageController = require('./image-controller');

module.exports = {
  chatController,
  imageController
};