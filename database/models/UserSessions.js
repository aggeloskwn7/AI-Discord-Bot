const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    history: [{ role: String, content: String }],
    lastUpdated: { type: Date, default: Date.now }
});

// Auto-delete old messages after 24 hours (MongoDB TTL Index)
userSessionSchema.index({ lastUpdated: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('UserSessions', userSessionSchema);