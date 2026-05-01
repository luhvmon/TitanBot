import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Colors } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('See all available commands'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(Colors.primary)
            .setTitle('📖 Commands')
            .addFields(
                {
                    name: '🛡️ Moderation',
                    value: '`/ban` `/kick` `/timeout` `/untimeout` `/warn` `/warnings` `/purge` `/lock` `/unlock`',
                },
                {
                    name: '👋 Welcome',
                    value: '`/setwelcome` `/testwelcome`',
                },
                {
                    name: '🎉 Fun',
                    value: '`/flip` `/roll` `/8ball` `/ship` `/mock` `/fact`',
                },
                {
                    name: '⚙️ Core',
                    value: '`/ping` `/help` `/serverinfo` `/userinfo`',
                },
            )
            .setFooter({ text: `${interaction.guild.name}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
