import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member from the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(opt => opt.setName('user').setDescription('User to kick').setRequired(true))
        .addStringOption(opt => opt.setName('reason').setDescription('Reason for the kick').setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const target = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = interaction.guild.members.cache.get(target.id);

        if (!member) return interaction.editReply({ embeds: [errorEmbed('Not Found', 'That user is not in this server.')] });
        if (!member.kickable) return interaction.editReply({ embeds: [errorEmbed('Cannot Kick', 'I cannot kick that user.')] });
        if (member.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.editReply({ embeds: [errorEmbed('Cannot Kick', 'You cannot kick someone with an equal or higher role.')] });
        }

        try {
            await member.kick(reason);
            await interaction.editReply({ embeds: [successEmbed('Kicked', `**${target.tag}** has been kicked.\nReason: ${reason}`)] });
        } catch {
            await interaction.editReply({ embeds: [errorEmbed('Error', 'Failed to kick that user.')] });
        }
    },
};
