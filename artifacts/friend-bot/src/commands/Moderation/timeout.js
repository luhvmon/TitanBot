import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout a member')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(opt => opt.setName('user').setDescription('User to timeout').setRequired(true))
        .addIntegerOption(opt => opt.setName('minutes').setDescription('Duration in minutes').setMinValue(1).setMaxValue(40320).setRequired(true))
        .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const target = interaction.options.getUser('user');
        const minutes = interaction.options.getInteger('minutes');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = interaction.guild.members.cache.get(target.id);

        if (!member) return interaction.editReply({ embeds: [errorEmbed('Not Found', 'That user is not in this server.')] });
        if (!member.moderatable) return interaction.editReply({ embeds: [errorEmbed('Cannot Timeout', 'I cannot timeout that user.')] });

        try {
            await member.timeout(minutes * 60 * 1000, reason);
            await interaction.editReply({ embeds: [successEmbed('Timed Out', `**${target.tag}** has been timed out for **${minutes} minute(s)**.\nReason: ${reason}`)] });
        } catch {
            await interaction.editReply({ embeds: [errorEmbed('Error', 'Failed to timeout that user.')] });
        }
    },
};
