const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    aiChannel: { type: String, default: null },
    personality: { type: String, default: "Default AI" },
    aiModel: { type: String, default: "gpt-4" },
    messageRetentionDays: { type: Number, default: 7 }
}, { timestamps: true });

serverSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 604800 });

module.exports = mongoose.model('ServerSettings', serverSchema);
