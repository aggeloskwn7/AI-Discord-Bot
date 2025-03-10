const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const ServerSettings = require('../../database/models/ServerSettings');
const { logError } = require('../../utils/errorHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-personality')
        .setDescription('Customize AI personality (Admins Only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Restrict command to admins
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
        try {
            // Ensure command is used in a guild
            if (!interaction.guild) {
                return interaction.reply({ content: "❌ This command can only be used in a server.", ephemeral: true });
            }

            // Ensure only admins can use this command
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: "❌ You need `Administrator` permission to use this command.", ephemeral: true });
            }

            const selectedPersonality = interaction.options.getString('type');

            // Enforce AI behavior constraints
            const finalPersonality = `${selectedPersonality} - Never speak like an AI, always act cool, chill, and engaging in conversations like a real person.`;

            // Update only the personality field, keeping other settings intact
            const updatedSettings = await ServerSettings.findOneAndUpdate(
                { guildId: interaction.guild.id },
                { $set: { personality: finalPersonality } },
                { upsert: true, new: true }
            );

            if (!updatedSettings) {
                throw new Error("Failed to update server settings.");
            }

            await interaction.reply({ content: `✅ AI personality set to **${selectedPersonality}** (Modified to always stay cool and never sound like an AI).` });

        } catch (error) {
            logError(error);
            await interaction.reply({ content: "⚠️ An error occurred while updating AI personality. Please try again later.", ephemeral: true });
        }
    }
};