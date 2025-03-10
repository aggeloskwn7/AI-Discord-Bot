const fs = require('fs');

function logError(error) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ERROR: ${error.stack || error.message}\n`;
    
    fs.appendFileSync('errors.log', logMessage);
    console.error("[❌] An error occurred:", error);
}

module.exports = { logError };