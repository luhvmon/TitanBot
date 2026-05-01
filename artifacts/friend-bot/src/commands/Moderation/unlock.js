import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Unlock a channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addChannelOption(opt => opt.setName('channel').setDescription('Channel to unlock (defaults to current)').setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        try {
            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null });
            await channel.send({ embeds: [successEmbed('🔓 Channel Unlocked', 'This channel has been unlocked.')] });
            await interaction.editReply({ embeds: [successEmbed('Unlocked', `${channel} has been unlocked.`)] });
        } catch {
            await interaction.editReply({ embeds: [errorEmbed('Error', 'Failed to unlock that channel.')] });
        }
    },
};
