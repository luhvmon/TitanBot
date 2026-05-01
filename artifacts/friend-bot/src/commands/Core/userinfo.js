import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Colors } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('View info about a user')
        .addUserOption(opt => opt.setName('user').setDescription('The user to look up').setRequired(false)),
    async execute(interaction) {
        const target = interaction.options.getUser('user') || interaction.user;
        const member = interaction.guild.members.cache.get(target.id);

        const embed = new EmbedBuilder()
            .setColor(Colors.primary)
            .setTitle(target.tag)
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'ID', value: target.id, inline: true },
                { name: 'Bot', value: target.bot ? 'Yes' : 'No', inline: true },
                { name: 'Account Created', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`, inline: true },
            );

        if (member) {
            embed.addFields(
                { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: 'Nickname', value: member.nickname || 'None', inline: true },
                { name: 'Top Role', value: `${member.roles.highest}`, inline: true },
            );
        }

        embed.setTimestamp();
        await interaction.reply({ embeds: [embed] });
    },
};
