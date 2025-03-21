const UserSessions = require('../database/models/UserSessions');

// Rate limit configuration
const RATE_LIMIT = {
    requestsPerMinute: 5,  // Maximum requests per minute
    cooldownMinutes: 1     // Cooldown period in minutes
};

class RateLimiter {
    constructor() {
        this.userRequests = new Map();
    }

    async checkRateLimit(userId, guildId) {
        const now = Date.now();
        const key = `${userId}-${guildId}`;
        
        // Get user's request history
        let userData = this.userRequests.get(key);
        
        if (!userData) {
            // First request
            this.userRequests.set(key, {
                requests: [now],
                cooldownUntil: null
            });
            return { allowed: true, remaining: RATE_LIMIT.requestsPerMinute - 1 };
        }

        // Check if user is in cooldown
        if (userData.cooldownUntil && now < userData.cooldownUntil) {
            const remainingTime = Math.ceil((userData.cooldownUntil - now) / 1000);
            return { 
                allowed: false, 
                remaining: 0,
                message: `Please wait ${remainingTime} seconds before making more requests.`
            };
        }

        // Remove old requests
        userData.requests = userData.requests.filter(time => 
            now - time < 60000 // Remove requests older than 1 minute
        );

        // Check if user has exceeded rate limit
        if (userData.requests.length >= RATE_LIMIT.requestsPerMinute) {
            userData.cooldownUntil = now + (RATE_LIMIT.cooldownMinutes * 60000);
            this.userRequests.set(key, userData);
            return { 
                allowed: false, 
                remaining: 0,
                message: `Rate limit exceeded. Please wait ${RATE_LIMIT.cooldownMinutes} minute(s) before trying again.`
            };
        }

        // Add new request
        userData.requests.push(now);
        this.userRequests.set(key, userData);

        return { 
            allowed: true, 
            remaining: RATE_LIMIT.requestsPerMinute - userData.requests.length 
        };
    }

    // Clean up old data periodically
    cleanup() {
        const now = Date.now();
        for (const [key, data] of this.userRequests.entries()) {
            if (data.cooldownUntil && now > data.cooldownUntil) {
                this.userRequests.delete(key);
            }
        }
    }
}

// Create singleton instance
const rateLimiter = new RateLimiter();

// Clean up every 5 minutes
setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);

module.exports = rateLimiter;