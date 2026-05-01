const mongoose = require('mongoose');
const ServerSettings = require('./ServerSettings');

const userSessionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    history: [{ role: String, content: String }],
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

async function getRetentionPeriod(guildId) {
    const settings = await ServerSettings.findOne({ guildId });
    return settings?.messageRetentionDays ? settings.messageRetentionDays * 86400 : 604800;
}

userSessionSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('UserSessions', userSessionSchema);
