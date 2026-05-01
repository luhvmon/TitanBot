import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { errorEmbed, Colors } from '../../utils/embeds.js';
import { getWarnings } from './warn.js';

export default {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('View warnings for a user')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(opt => opt.setName('user').setDescription('User to check').setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const warns = getWarnings(interaction.guildId, target.id);

        if (!warns.length) {
            return interaction.reply({ embeds: [errorEmbed('No Warnings', `**${target.tag}** has no warnings.`)], ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor(Colors.warning)
            .setTitle(`⚠️ Warnings for ${target.tag}`)
            .setDescription(warns.map((w, i) => `**${i + 1}.** ${w.reason}\n> By ${w.moderator} — <t:${Math.floor(new Date(w.date).getTime() / 1000)}:R>`).join('\n\n'))
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
