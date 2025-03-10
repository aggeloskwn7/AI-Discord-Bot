const { SlashCommandBuilder } = require('discord.js');
const ServerSettings = require('../../database/models/ServerSettings');
const UserSessions = require('../../database/models/UserSessions');
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chat')
        .setDescription('Chat with the AI')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Your message to the AI')
                .setRequired(true)
        ),
    async execute(interaction) {
        const userMessage = interaction.options.getString('message');
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        // Retrieve existing conversation history
        let session = await UserSessions.findOne({ userId, guildId });
        if (!session) {
            session = new UserSessions({ userId, guildId, history: [] });
        }

        // Add user message to history
        session.history.push({ role: 'user', content: userMessage });

        // Limit history to last 10 messages
        if (session.history.length > 10) session.history.shift();

        await session.save();

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4",
                messages: session.history
            });

            const aiResponse = response.choices[0].message.content;

            // Save AI response in conversation history
            session.history.push({ role: 'assistant', content: aiResponse });
            await session.save();

            await interaction.reply({ content: aiResponse });
        } catch (error) {
            console.error("[❌] AI Error:", error);
            await interaction.reply({ content: "⚠️ AI is currently unavailable." });
        }
    }
};