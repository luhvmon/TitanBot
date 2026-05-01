import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Colors } from '../../utils/embeds.js';

const facts = [
    'Honey never spoils. Archaeologists have found 3,000-year-old honey in Egyptian tombs.',
    'A group of flamingos is called a flamboyance.',
    'Octopuses have three hearts and blue blood.',
    'The shortest war in history lasted 38 minutes.',
    'Bananas are slightly radioactive.',
    'A day on Venus is longer than a year on Venus.',
    'Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid.',
    'There are more possible games of chess than atoms in the observable universe.',
    'Sharks are older than trees.',
    'The human brain uses about 20% of the body\'s total energy.',
    'Crows can recognize and remember human faces.',
    'A bolt of lightning is five times hotter than the surface of the sun.',
    'Wombats produce cube-shaped droppings.',
    'Butterflies taste with their feet.',
    'The Eiffel Tower can be 15 cm taller in summer due to thermal expansion.',
];

export default {
    data: new SlashCommandBuilder()
        .setName('fact')
        .setDescription('Get a random fun fact'),
    async execute(interaction) {
        const fact = facts[Math.floor(Math.random() * facts.length)];
        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(Colors.primary).setTitle('💡 Fun Fact').setDescription(fact)],
        });
    },
};
