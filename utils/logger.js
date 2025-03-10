const fs = require('fs');

function logMessage(content) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync('logs.txt', `[${timestamp}] ${content}\n`);
}

module.exports = { logMessage };