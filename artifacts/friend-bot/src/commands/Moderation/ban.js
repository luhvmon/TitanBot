import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member from the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(opt => opt.setName('user').setDescription('User to ban').setRequired(true))
        .addStringOption(opt => opt.setName('reason').setDescription('Reason for the ban').setRequired(false))
        .addIntegerOption(opt => opt.setName('days').setDescription('Days of messages to delete (0-7)').setMinValue(0).setMaxValue(7).setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const target = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const days = interaction.options.getInteger('days') ?? 0;

        const member = interaction.guild.members.cache.get(target.id);
        if (member) {
            if (!member.bannable) {
                return interaction.editReply({ embeds: [errorEmbed('Cannot Ban', 'I cannot ban that user.')] });
            }
            if (member.roles.highest.position >= interaction.member.roles.highest.position) {
                return interaction.editReply({ embeds: [errorEmbed('Cannot Ban', 'You cannot ban someone with an equal or higher role.')] });
            }
        }

        try {
            await interaction.guild.members.ban(target, { reason, deleteMessageDays: days });
            await interaction.editReply({ embeds: [successEmbed('Banned', `**${target.tag}** has been banned.\nReason: ${reason}`)] });
        } catch {
            await interaction.editReply({ embeds: [errorEmbed('Error', 'Failed to ban that user.')] });
        }
    },
};
