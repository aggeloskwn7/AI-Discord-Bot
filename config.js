const dotenv = require('dotenv');
const { logError } = require('./utils/errorHandler');

try {
    dotenv.config();

    const requiredEnvVars = ['DISCORD_TOKEN', 'MONGO_URI', 'OPENAI_API_KEY'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    module.exports = {
        discordToken: process.env.DISCORD_TOKEN,
        mongoURI: process.env.MONGO_URI,
        openAIKey: process.env.OPENAI_API_KEY,
        prefix: process.env.BOT_PREFIX || '!',
    };

} catch (error) {
    logError(error);
    console.error("❌ Failed to load configuration:", error.message);
    process.exit(1);
}
