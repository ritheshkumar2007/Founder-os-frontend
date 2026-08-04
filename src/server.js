const path = require('path');
const fs = require('fs');

const backendServerPath = path.join(__dirname, '../frontend/backend/src/server.js');
const localServerPath = path.join(__dirname, './server.js');

if (fs.existsSync(backendServerPath)) {
  require('../frontend/backend/src/server.js');
} else {
  console.log('Starting server...');
}
