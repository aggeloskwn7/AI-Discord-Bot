const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const ServerSettings = require('../../database/models/ServerSettings');
const { logError } = require('../../utils/errorHandler');

// Predefined personality types with their system instructions
const PERSONALITIES = {
    friendly: "You are a friendly and approachable person who loves making new friends. You're warm, encouraging, and always ready to help.",
    sarcastic: "You are witty and sarcastic, with a dry sense of humor. You love making clever observations and playful jabs.",
    professional: "You are a knowledgeable and professional individual who provides well-thought-out, accurate information.",
    funny: "You are hilarious and love making jokes. You're playful, use puns, and keep the conversation light and entertaining.",
    philosophical: "You are deep and thoughtful, often pondering life's big questions. You engage in meaningful discussions.",
    casual: "You are laid-back and chill, using casual language and keeping things simple and relatable."
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-personality')
        .setDescription('Change the AI\'s personality type')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Choose a personality type')
                .setRequired(true)
                .addChoices(
                    { name: 'Friendly', value: 'friendly' },
                    { name: 'Sarcastic', value: 'sarcastic' },
                    { name: 'Professional', value: 'professional' },
                    { name: 'Funny', value: 'funny' },
                    { name: 'Philosophical', value: 'philosophical' },
                    { name: 'Casual', value: 'casual' }
                )
        ),

    async execute(interaction) {
        try {
            // Check if user has admin permissions
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return interaction.reply({
                    content: "❌ Only administrators can change the AI's personality.",
                    ephemeral: true
                });
            }

            const personalityType = interaction.options.getString('type');
            const systemInstruction = PERSONALITIES[personalityType];

            if (!systemInstruction) {
                return interaction.reply({
                    content: "❌ Invalid personality type selected.",
                    ephemeral: true
                });
            }

            // Update server settings with new personality
            await ServerSettings.findOneAndUpdate(
                { guildId: interaction.guild.id },
                { 
                    personalityType,
                    systemInstruction
                },
                { upsert: true, new: true }
            );

            await interaction.reply({
                content: `✅ AI personality has been set to **${personalityType}** mode!`,
                ephemeral: true
            });
        } catch (error) {
            logError(error);
            await interaction.reply({
                content: "⚠️ An error occurred while setting the personality.",
                ephemeral: true
            });
        }
    }
};