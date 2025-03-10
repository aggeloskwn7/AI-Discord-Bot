const { SlashCommandBuilder } = require('discord.js');
const ServerSettings = require('../../database/models/ServerSettings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('View AI configuration settings for this server'),
    async execute(interaction) {
        const settings = await ServerSettings.findOne({ guildId: interaction.guild.id });

        if (!settings) {
            return interaction.reply({ content: "⚠️ No AI settings found. Use `/setup-ai` to configure.", ephemeral: true });
        }

        await interaction.reply({
            content: `🔧 **AI Config:**\n- **Channel:** <#${settings.aiChannel || 'Not Set'}>\n- **Personality:** ${settings.personality}`,
            ephemeral: true
        });
    }
};