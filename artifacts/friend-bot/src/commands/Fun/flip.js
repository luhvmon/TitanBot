import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Colors } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('flip')
        .setDescription('Flip a coin'),
    async execute(interaction) {
        const result = Math.random() < 0.5 ? '🪙 Heads!' : '🪙 Tails!';
        await interaction.reply({ embeds: [new EmbedBuilder().setColor(Colors.primary).setDescription(result)] });
    },
};
