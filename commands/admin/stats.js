const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const UserSessions = require('../../database/models/UserSessions');
const ServerSettings = require('../../database/models/ServerSettings');
const { logError } = require('../../utils/errorHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('View bot usage statistics (Admins Only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Restrict to admins
    async execute(interaction) {
        try {
            // Check if the user has the necessary permissions
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: "❌ You need `Administrator` permission to use this command.", ephemeral: true });
            }

            // Fetch stats with database existence checks
            const totalMessages = await UserSessions.estimatedDocumentCount().catch(err => {
                logError(err);
                return 0;
            });

            const activeUsers = await UserSessions.distinct('userId').catch(err => {
                logError(err);
                return [];
            });

            const serverCount = await ServerSettings.estimatedDocumentCount().catch(err => {
                logError(err);
                return 0;
            });

            await interaction.reply({
                content: `📊 **AI Bot Stats:**\n📌 **Total Messages:** ${totalMessages}\n👥 **Active Users:** ${activeUsers.length}\n🏠 **Servers Using AI:** ${serverCount}`,
                ephemeral: true
            });

        } catch (error) {
            logError(error);
            await interaction.reply({ content: "⚠️ An error occurred while fetching bot statistics. Please try again later.", ephemeral: true });
        }
    }
};