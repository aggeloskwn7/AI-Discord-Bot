const { SlashCommandBuilder } = require('discord.js');
const UserSessions = require('../../database/models/UserSessions');

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
        ),
    async execute(interaction) {
        const scope = interaction.options.getString('scope');
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        if (scope === 'server' && !interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: "❌ Only admins can reset the entire server's AI memory.", ephemeral: true });
        }

        if (scope === 'user') {
            await UserSessions.deleteMany({ userId, guildId });
            return interaction.reply({ content: "✅ Your AI memory has been reset!", ephemeral: true });
        }

        if (scope === 'server') {
            await UserSessions.deleteMany({ guildId });
            return interaction.reply({ content: "✅ AI memory for this entire server has been reset!" });
        }
    }
};