import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Colors } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ship')
        .setDescription('Calculate the compatibility between two users')
        .addUserOption(opt => opt.setName('user1').setDescription('First user').setRequired(true))
        .addUserOption(opt => opt.setName('user2').setDescription('Second user').setRequired(false)),
    async execute(interaction) {
        const user1 = interaction.options.getUser('user1');
        const user2 = interaction.options.getUser('user2') || interaction.user;
        const score = Math.floor(Math.random() * 101);
        const bar = '█'.repeat(Math.floor(score / 10)) + '░'.repeat(10 - Math.floor(score / 10));
        const emoji = score >= 80 ? '💘' : score >= 50 ? '💕' : score >= 30 ? '💔' : '🚫';

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.primary)
                    .setTitle(`${emoji} Compatibility`)
                    .setDescription(`**${user1.username}** + **${user2.username}**\n\n\`${bar}\` **${score}%**`),
            ],
        });
    },
};
