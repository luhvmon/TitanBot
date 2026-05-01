import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Colors } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('mock')
        .setDescription('MoCk SoMeOnE\'s TeXt')
        .addStringOption(opt => opt.setName('text').setDescription('Text to mock').setRequired(true)),
    async execute(interaction) {
        const text = interaction.options.getString('text');
        const mocked = text.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('');
        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(Colors.primary).setDescription(`🙃 ${mocked}`)],
        });
    },
};
