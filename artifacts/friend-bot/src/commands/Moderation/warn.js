import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';

const warnings = new Map();

export function getWarnings(guildId, userId) {
    return warnings.get(`${guildId}:${userId}`) || [];
}

export default {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a member')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(opt => opt.setName('user').setDescription('User to warn').setRequired(true))
        .addStringOption(opt => opt.setName('reason').setDescription('Reason for the warning').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const target = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const key = `${interaction.guildId}:${target.id}`;

        const userWarnings = warnings.get(key) || [];
        userWarnings.push({ reason, moderator: interaction.user.tag, date: new Date().toISOString() });
        warnings.set(key, userWarnings);

        await interaction.editReply({
            embeds: [successEmbed('Warned', `**${target.tag}** has been warned.\nReason: ${reason}\nTotal warnings: **${userWarnings.length}**`)],
        });

        try {
            await target.send(`⚠️ You have been warned in **${interaction.guild.name}**.\nReason: ${reason}`);
        } catch {}
    },
};
