import { SlashCommandBuilder } from 'discord.js';
import { infoEmbed } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check the bot\'s response time'),
    async execute(interaction) {
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        await interaction.editReply({
            content: '',
            embeds: [infoEmbed('🏓 Pong!', `Latency: **${latency}ms** | API: **${Math.round(interaction.client.ws.ping)}ms**`)],
        });
    },
};
