import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('Remove a timeout from a member')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(opt => opt.setName('user').setDescription('User to un-timeout').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const target = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(target.id);

        if (!member) return interaction.editReply({ embeds: [errorEmbed('Not Found', 'That user is not in this server.')] });

        try {
            await member.timeout(null);
            await interaction.editReply({ embeds: [successEmbed('Timeout Removed', `**${target.tag}**'s timeout has been removed.`)] });
        } catch {
            await interaction.editReply({ embeds: [errorEmbed('Error', 'Failed to remove the timeout.')] });
        }
    },
};
