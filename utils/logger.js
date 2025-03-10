const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../logs.txt');

function logMessage(content) {
    try {
        const timestamp = new Date().toISOString();
        
        // Ensure logs file exists before writing
        if (!fs.existsSync(logFilePath)) {
            fs.writeFileSync(logFilePath, '', { flag: 'w' });
        }

        fs.appendFileSync(logFilePath, `[${timestamp}] ${content}\n`);
    } catch (error) {
        console.error("❌ Error writing to log file:", error);
    }
}

module.exports = { logMessage };