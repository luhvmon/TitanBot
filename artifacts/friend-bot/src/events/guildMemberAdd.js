import { Events, EmbedBuilder } from 'discord.js';

export default {
    name: Events.GuildMemberAdd,
    async execute(member, client) {
        const welcomeChannelId = process.env.FRIEND_WELCOME_CHANNEL;
        if (!welcomeChannelId) return;

        const channel = member.guild.channels.cache.get(welcomeChannelId);
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle(`Welcome to ${member.guild.name}!`)
            .setDescription(`Hey ${member}, glad you're here! 👋`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'Member', value: member.user.tag, inline: true },
                { name: 'Member #', value: `${member.guild.memberCount}`, inline: true },
            )
            .setTimestamp();

        await channel.send({ embeds: [embed] }).catch(() => {});
    },
};
