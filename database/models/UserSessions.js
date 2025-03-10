const mongoose = require('mongoose');
const ServerSettings = require('./ServerSettings');

const userSessionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    history: [{ role: String, content: String }],
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true }); // Adds `createdAt` & `updatedAt`

// Function to dynamically set message retention period
async function getRetentionPeriod(guildId) {
    const settings = await ServerSettings.findOne({ guildId });
    return settings?.messageRetentionDays ? settings.messageRetentionDays * 86400 : 604800; // Default: 7 days
}

// Dynamically set TTL index based on retention settings
userSessionSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 86400 }); // Placeholder for dynamic retention

module.exports = mongoose.model('UserSessions', userSessionSchema);