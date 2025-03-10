const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    aiChannel: { type: String, default: null },
    personality: { type: String, default: "Default AI" },
    aiModel: { type: String, default: "gpt-4" }, // Allows switching AI models
    messageRetentionDays: { type: Number, default: 7 } // Auto-delete messages after X days
}, { timestamps: true }); // Adds `createdAt` & `updatedAt`

// Auto-delete old records if needed (MongoDB TTL index)
serverSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 604800 }); // Deletes after 7 days

module.exports = mongoose.model('ServerSettings', serverSchema);