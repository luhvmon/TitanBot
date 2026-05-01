import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Colors } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('View information about this server'),
    async execute(interaction) {
        const { guild } = interaction;
        await guild.fetch();

        const embed = new EmbedBuilder()
            .setColor(Colors.primary)
            .setTitle(guild.name)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
                { name: 'Members', value: `${guild.memberCount}`, inline: true },
                { name: 'Channels', value: `${guild.channels.cache.size}`, inline: true },
                { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
                { name: 'Boosts', value: `${guild.premiumSubscriptionCount || 0}`, inline: true },
                { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
