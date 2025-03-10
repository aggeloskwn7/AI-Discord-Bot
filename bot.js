require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { logError } = require('./utils/errorHandler');
const ServerSettings = require('./database/models/ServerSettings');
const { listenForMessages } = require('./commands/ai/setup-ai'); // Import AI message handler

const requiredEnvVars = ['DISCORD_TOKEN', 'MONGO_URI'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.commands = new Collection();

// Load commands dynamically
const commandFolders = fs.readdirSync('./commands');
for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        try {
            const command = require(`./commands/${folder}/${file}`);
            client.commands.set(command.data.name, command);
        } catch (error) {
            logError(error);
            console.error(`❌ Failed to load command: ${file}`);
        }
    }
}

// Database Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log('[✅] Connected to MongoDB');
    })
    .catch(err => {
        logError(err);
        console.error('[❌] MongoDB Connection Error:', err);
        process.exit(1);
    });

// Bot Ready Event
client.once('ready', async () => {
    console.log(`[🤖] Logged in as ${client.user.tag}`);

    // Ensure AI channels are correctly set up
    try {
        const servers = await ServerSettings.find({});
        servers.forEach(server => {
            if (!server.aiChannel) {
                console.warn(`[⚠️] AI channel not set for server: ${server.guildId}`);
            }
        });
    } catch (error) {
        logError(error);
        console.error('❌ Error fetching server settings:', error);
    }
});

// Interaction Handling
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (command) {
        try {
            await command.execute(interaction);
        } catch (error) {
            logError(error);
            console.error(`❌ Command execution error (${interaction.commandName}):`, error);
            await interaction.reply({ content: "⚠️ An unexpected error occurred. Please try again.", ephemeral: true });
        }
    }
});

// Listen for messages in AI-configured channels
client.on('messageCreate', async (message) => {
    if (message.author.bot) return; // Ignore bot messages

    try {
        // Fetch AI settings for this guild
        const serverSettings = await ServerSettings.findOne({ guildId: message.guild.id });

        if (!serverSettings || !serverSettings.aiChannel) return; // No AI settings found

        if (message.channel.id === serverSettings.aiChannel) {
            await listenForMessages(message); // Process AI message handling
        }
    } catch (error) {
        logError(error);
        console.error("❌ Error processing AI message:", error);
    }
});

// Handle Bot Disconnects & Reconnects
client.on('shardError', error => {
    logError(error);
    console.error('❌ WebSocket connection error:', error);
});

client.on('reconnecting', () => {
    console.warn('[🔄] Bot reconnecting...');
});

client.on('resume', () => {
    console.log('[✅] Bot reconnected successfully.');
});

// Global Error Handling
process.on('unhandledRejection', (reason, promise) => {
    logError(reason);
    console.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error) => {
    logError(error);
    console.error('Uncaught Exception:', error);
    process.exit(1); // Exit to prevent unstable state
});

// Bot Login
client.login(process.env.DISCORD_TOKEN).catch(error => {
    logError(error);
    console.error('❌ Failed to log in:', error);
    process.exit(1);
});