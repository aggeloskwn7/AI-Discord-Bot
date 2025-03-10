const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const UserSessions = require('../../database/models/UserSessions');
const { logError } = require('../../utils/errorHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset-ai')
        .setDescription('Reset AI conversation memory')
        .addStringOption(option =>
            option.setName('scope')
                .setDescription('Reset for yourself or the entire server')
                .setRequired(true)
                .addChoices(
                    { name: 'Only Me', value: 'user' },
                    { name: 'Entire Server (Admins Only)', value: 'server' }
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Restrict to admins for server-wide resets
    async execute(interaction) {
        try {
            const scope = interaction.options.getString('scope');
            const userId = interaction.user.id;
            const guildId = interaction.guild.id;

            // Ensure only admins can reset the entire server
            if (scope === 'server' && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: "❌ Only admins can reset the entire server's AI memory.", ephemeral: true });
            }

            if (scope === 'user') {
                await UserSessions.deleteMany({ userId, guildId });
                return interaction.reply({ content: "✅ Your AI memory has been successfully reset!", ephemeral: true });
            }

            if (scope === 'server') {
                await UserSessions.deleteMany({ guildId });
                return interaction.reply({ content: "✅ AI memory for this entire server has been successfully reset!" });
            }

        } catch (error) {
            logError(error);
            await interaction.reply({ content: "⚠️ An error occurred while attempting to reset AI memory. Please try again later.", ephemeral: true });
        }
    }
};