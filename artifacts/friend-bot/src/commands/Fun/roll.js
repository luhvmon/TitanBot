import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Colors } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Roll a dice')
        .addIntegerOption(opt => opt.setName('sides').setDescription('Number of sides (default: 6)').setMinValue(2).setMaxValue(1000).setRequired(false)),
    async execute(interaction) {
        const sides = interaction.options.getInteger('sides') || 6;
        const result = Math.floor(Math.random() * sides) + 1;
        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(Colors.primary).setDescription(`🎲 You rolled a **${result}** (d${sides})`)]
        });
    },
};
