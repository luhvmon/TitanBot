import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { errorEmbed } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('testwelcome')
        .setDescription('Send a test welcome message')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
        const channelId = process.env.FRIEND_WELCOME_CHANNEL;
        const channel = channelId ? interaction.guild.channels.cache.get(channelId) : interaction.channel;

        if (!channel) {
            return interaction.reply({ embeds: [errorEmbed('No Channel', 'Set a welcome channel first with `/setwelcome`.')], ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle(`Welcome to ${interaction.guild.name}!`)
            .setDescription(`Hey ${interaction.member}, glad you're here! 👋`)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'Member', value: interaction.user.tag, inline: true },
                { name: 'Member #', value: `${interaction.guild.memberCount}`, inline: true },
            )
            .setFooter({ text: 'This is a test welcome message' })
            .setTimestamp();

        await channel.send({ embeds: [embed] });
        await interaction.reply({ content: `Test welcome sent in ${channel}!`, ephemeral: true });
    },
};
