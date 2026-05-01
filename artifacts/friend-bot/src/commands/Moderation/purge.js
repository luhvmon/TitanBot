import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Delete multiple messages at once')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(opt => opt.setName('amount').setDescription('Number of messages to delete (1-100)').setMinValue(1).setMaxValue(100).setRequired(true))
        .addUserOption(opt => opt.setName('user').setDescription('Only delete messages from this user').setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const amount = interaction.options.getInteger('amount');
        const targetUser = interaction.options.getUser('user');

        try {
            const messages = await interaction.channel.messages.fetch({ limit: 100 });
            let toDelete = [...messages.values()].filter(m => Date.now() - m.createdTimestamp < 14 * 24 * 60 * 60 * 1000);
            if (targetUser) toDelete = toDelete.filter(m => m.author.id === targetUser.id);
            toDelete = toDelete.slice(0, amount);

            await interaction.channel.bulkDelete(toDelete, true);
            await interaction.editReply({ embeds: [successEmbed('Purged', `Deleted **${toDelete.length}** message(s).`)] });
        } catch {
            await interaction.editReply({ embeds: [errorEmbed('Error', 'Failed to delete messages. They may be older than 14 days.')] });
        }
    },
};
