import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Lock a channel so members cannot send messages')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addChannelOption(opt => opt.setName('channel').setDescription('Channel to lock (defaults to current)').setRequired(false))
        .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
            await channel.send({ embeds: [errorEmbed('🔒 Channel Locked', `This channel has been locked.\nReason: ${reason}`)] });
            await interaction.editReply({ embeds: [successEmbed('Locked', `${channel} has been locked.`)] });
        } catch {
            await interaction.editReply({ embeds: [errorEmbed('Error', 'Failed to lock that channel.')] });
        }
    },
};
