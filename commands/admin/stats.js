const { SlashCommandBuilder } = require('discord.js');
const UserSessions = require('../../database/models/UserSessions');
const ServerSettings = require('../../database/models/ServerSettings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('View bot usage statistics (Admins Only)'),
    async execute(interaction) {
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: "❌ You need `Administrator` permission to use this command.", ephemeral: true });
        }

        // Fetch stats
        const totalMessages = await UserSessions.countDocuments();
        const activeUsers = await UserSessions.distinct('userId');
        const serverCount = await ServerSettings.countDocuments();

        await interaction.reply({
            content: `📊 **AI Bot Stats**:\n- **Total Messages:** ${totalMessages}\n- **Active Users:** ${activeUsers.length}\n- **Servers Using AI:** ${serverCount}`,
            ephemeral: true
        });
    }
};