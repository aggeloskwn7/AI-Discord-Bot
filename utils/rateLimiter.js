const UserSessions = require('../database/models/UserSessions');

const RATE_LIMIT = {
    requestsPerMinute: 5,
    cooldownMinutes: 1
};

class RateLimiter {
    constructor() {
        this.userRequests = new Map();
    }

    async checkRateLimit(userId, guildId) {
        const now = Date.now();
        const key = `${userId}-${guildId}`;
        
        let userData = this.userRequests.get(key);
        
        if (!userData) {
            this.userRequests.set(key, {
                requests: [now],
                cooldownUntil: null
            });
            return { allowed: true, remaining: RATE_LIMIT.requestsPerMinute - 1 };
        }

        if (userData.cooldownUntil && now < userData.cooldownUntil) {
            const remainingTime = Math.ceil((userData.cooldownUntil - now) / 1000);
            return { 
                allowed: false, 
                remaining: 0,
                message: `Please wait ${remainingTime} seconds before making more requests.`
            };
        }

        userData.requests = userData.requests.filter(time => 
            now - time < 60000
        );

        if (userData.requests.length >= RATE_LIMIT.requestsPerMinute) {
            userData.cooldownUntil = now + (RATE_LIMIT.cooldownMinutes * 60000);
            this.userRequests.set(key, userData);
            return { 
                allowed: false, 
                remaining: 0,
                message: `Rate limit exceeded. Please wait ${RATE_LIMIT.cooldownMinutes} minute(s) before trying again.`
            };
        }

        userData.requests.push(now);
        this.userRequests.set(key, userData);

        return { 
            allowed: true, 
            remaining: RATE_LIMIT.requestsPerMinute - userData.requests.length 
        };
    }

    cleanup() {
        const now = Date.now();
        for (const [key, data] of this.userRequests.entries()) {
            if (data.cooldownUntil && now > data.cooldownUntil) {
                this.userRequests.delete(key);
            }
        }
    }
}

const rateLimiter = new RateLimiter();

setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);

module.exports = rateLimiter;
