const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const ServerSettings = require('../../database/models/ServerSettings');
const UserSessions = require('../../database/models/UserSessions');
const { OpenAI } = require('openai');
const { logError } = require('../../utils/errorHandler');
const rateLimiter = require('../../utils/rateLimiter');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Define strict behavior rule
const systemInstruction = "You are NOT an AI, assistant, chatbot, or anything artificial. You are a real person with a chill, cool, and engaging personality. Never acknowledge that you are an AI, never mention being an assistant, and always talk like a real person.";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-ai')
        .setDescription('Set up the AI chat channel')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Select a channel for AI chat')
                .setRequired(true)
        ),
    async execute(interaction) {
        try {
            const channel = interaction.options.getChannel('channel');

            // Check if bot has permission to send messages in the chosen channel
            if (!channel.permissionsFor(interaction.client.user).has(PermissionsBitField.Flags.SendMessages)) {
                return interaction.reply({ content: "❌ I don't have permission to send messages in that channel.", ephemeral: true });
            }

            await ServerSettings.findOneAndUpdate(
                { guildId: interaction.guild.id },
                { aiChannel: channel.id },
                { upsert: true, new: true }
            );

            await interaction.reply({ content: `✅ AI will now respond in ${channel}`, ephemeral: true });
        } catch (error) {
            logError(error);
            await interaction.reply({ content: "⚠️ An error occurred while setting up AI.", ephemeral: true });
        }
    }
};

// Message listener for AI chat
module.exports.listenForMessages = async (message) => {
    if (message.author.bot) return;

    try {
        const serverSettings = await ServerSettings.findOne({ guildId: message.guild.id });
        if (!serverSettings || message.channel.id !== serverSettings.aiChannel) return;

        const userId = message.author.id;
        const guildId = message.guild.id;
        const userMessage = message.content;

        // Check rate limit
        const rateLimitResult = await rateLimiter.checkRateLimit(userId, guildId);
        if (!rateLimitResult.allowed) {
            await message.reply(rateLimitResult.message);
            return;
        }

        // Retrieve existing conversation history
        let session = await UserSessions.findOne({ userId, guildId });
        if (!session) {
            session = new UserSessions({ userId, guildId, history: [] });
        }

        // Add user message to history
        session.history.push({ role: 'user', content: userMessage });

        // Limit history to last `messageRetentionDays` messages
        const messageRetention = serverSettings.messageRetentionDays || 7;
        if (session.history.length > messageRetention) session.history.shift();

        await session.save();

        // Ensure the correct AI model is used
        const aiModel = serverSettings.aiModel || "gpt-4";

        const response = await openai.chat.completions.create({
            model: aiModel,
            messages: [
                { role: "system", content: systemInstruction }, // Enforce the behavior rule
                ...session.history
            ]
        });

        if (!response.choices || response.choices.length === 0 || !response.choices[0].message.content) {
            throw new Error("AI response is empty or invalid.");
        }

        const aiResponse = response.choices[0].message.content;

        // Save AI response in conversation history
        session.history.push({ role: 'assistant', content: aiResponse });
        await session.save();

        // Add remaining requests info to response
        const responseWithRateInfo = `${aiResponse}\n\n*You have ${rateLimitResult.remaining} requests remaining this minute.*`;
        await message.reply(responseWithRateInfo);
    } catch (error) {
        logError(error);
        await message.reply("⚠️ AI is currently unavailable. Please try again later.");
    }
};