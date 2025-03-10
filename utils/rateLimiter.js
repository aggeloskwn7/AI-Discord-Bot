const { RateLimiterMemory } = require('rate-limiter-flexible');

const rateLimiter = new RateLimiterMemory({
    points: 3, // Allow 3 messages per user
    duration: 10 // Per 10 seconds
});

async function checkRateLimit(userId) {
    try {
        await rateLimiter.consume(userId);
        return true;
    } catch {
        return false;
    }
}

module.exports = { checkRateLimit };