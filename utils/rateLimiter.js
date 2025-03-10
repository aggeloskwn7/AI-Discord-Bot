const { RateLimiterMemory } = require('rate-limiter-flexible');
const { logError } = require('./errorHandler');

const rateLimiter = new RateLimiterMemory({
    points: 3, // Allow 3 messages per user
    duration: 10 // Per 10 seconds
});

async function checkRateLimit(userId) {
    try {
        await rateLimiter.consume(userId);
        return true;
    } catch (error) {
        if (error.consumedPoints !== undefined) {
            // User hit the rate limit
            return false;
        }

        // Log unexpected errors
        logError(error);
        return false;
    }
}

module.exports = { checkRateLimit };