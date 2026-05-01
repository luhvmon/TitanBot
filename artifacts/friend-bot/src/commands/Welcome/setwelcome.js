import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('setwelcome')
        .setDescription('Set the channel for welcome messages')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addChannelOption(opt => opt.setName('channel').setDescription('Channel to send welcome messages in').setRequired(true)),
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');

        if (!channel.isTextBased()) {
            return interaction.reply({ embeds: [errorEmbed('Invalid Channel', 'Please select a text channel.')], ephemeral: true });
        }

        process.env.FRIEND_WELCOME_CHANNEL = channel.id;

        await interaction.reply({
            embeds: [successEmbed('Welcome Channel Set', `Welcome messages will be sent in ${channel}.`)],
            ephemeral: true,
        });
    },
};
