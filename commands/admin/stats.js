const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const ServerSettings = require('../../database/models/ServerSettings');
const UserSessions = require('../../database/models/UserSessions');
const { logError } = require('../../utils/errorHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('View bot usage statistics (Admin only)'),

    async execute(interaction) {
        try {
            // Check if user has admin permissions
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return interaction.reply({
                    content: "❌ Only administrators can view statistics.",
                    ephemeral: true
                });
            }

            // Get server settings
            const serverSettings = await ServerSettings.findOne({ guildId: interaction.guild.id });
            if (!serverSettings) {
                return interaction.reply({
                    content: "❌ No settings found for this server.",
                    ephemeral: true
                });
            }

            // Get all user sessions for this server
            const userSessions = await UserSessions.find({ guildId: interaction.guild.id });
            
            // Calculate statistics
            const totalMessages = userSessions.reduce((acc, session) => acc + session.history.length, 0);
            const uniqueUsers = userSessions.length;
            const averageMessagesPerUser = uniqueUsers > 0 ? (totalMessages / uniqueUsers).toFixed(1) : 0;

            // Create embed
            const statsEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('🤖 Bot Statistics')
                .setDescription(`Statistics for ${interaction.guild.name}`)
                .addFields(
                    { name: 'Total Messages', value: totalMessages.toString(), inline: true },
                    { name: 'Unique Users', value: uniqueUsers.toString(), inline: true },
                    { name: 'Avg. Messages/User', value: averageMessagesPerUser, inline: true },
                    { name: 'AI Channel', value: serverSettings.aiChannel ? `<#${serverSettings.aiChannel}>` : 'Not set', inline: true },
                    { name: 'Personality', value: serverSettings.personalityType || 'Default', inline: true },
                    { name: 'Message Retention', value: `${serverSettings.messageRetentionDays || 7} days`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Bot Statistics' });

            await interaction.reply({ embeds: [statsEmbed], ephemeral: true });
        } catch (error) {
            logError(error);
            await interaction.reply({
                content: "⚠️ An error occurred while fetching statistics.",
                ephemeral: true
            });
        }
    }
};