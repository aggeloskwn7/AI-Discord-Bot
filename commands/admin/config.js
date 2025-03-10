const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const ServerSettings = require('../../database/models/ServerSettings');
const { logError } = require('../../utils/errorHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('View AI configuration settings for this server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Restrict to admins
    async execute(interaction) {
        try {
            // Check if the user has the necessary permissions
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: "❌ You need `Administrator` permission to use this command.", ephemeral: true });
            }

            const settings = await ServerSettings.findOne({ guildId: interaction.guild.id });

            if (!settings) {
                return interaction.reply({ content: "⚠️ No AI settings found. Use `/setup-ai` to configure.", ephemeral: true });
            }

            await interaction.reply({
                content: `🔧 **AI Config:**\n📌 **Channel:** ${settings.aiChannel ? `<#${settings.aiChannel}>` : "Not Set"}\n🎭 **Personality:** ${settings.personality || "Default"}\n🧠 **AI Model:** ${settings.aiModel || "gpt-4"}\n⏳ **Message Retention:** ${settings.messageRetentionDays || 7} days`,
                ephemeral: true
            });

        } catch (error) {
            logError(error);
            await interaction.reply({ content: "⚠️ An error occurred while fetching the AI configuration. Please try again later.", ephemeral: true });
        }
    }
};