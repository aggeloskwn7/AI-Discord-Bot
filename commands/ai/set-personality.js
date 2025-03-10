const { SlashCommandBuilder } = require('discord.js');
const ServerSettings = require('../../database/models/ServerSettings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-personality')
        .setDescription('Customize AI personality')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Set the AI personality')
                .setRequired(true)
                .addChoices(
                    { name: 'Funny AI', value: 'Funny AI' },
                    { name: 'Professional AI', value: 'Professional AI' },
                    { name: 'Sarcastic AI', value: 'Sarcastic AI' },
                    { name: 'Default AI', value: 'Default AI' }
                )
        ),
    async execute(interaction) {
        const personality = interaction.options.getString('type');

        await ServerSettings.findOneAndUpdate(
            { guildId: interaction.guild.id },
            { personality },
            { upsert: true, new: true }
        );

        await interaction.reply({ content: `✅ AI personality set to **${personality}**` });
    }
};