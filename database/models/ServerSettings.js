const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    aiChannel: { type: String, default: null },
    personality: { type: String, default: "Default AI" } // New field
});

module.exports = mongoose.model('ServerSettings', serverSchema);