import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    MessageFlags,
} from 'discord.js';
import { getColor } from '../../config/bot.js';
import { errorEmbed, successEmbed } from '../../utils/embeds.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { logger } from '../../utils/logger.js';
import {
    getAutoresponds,
    addAutorespond,
    removeAutorespond,
    clearAutoresponds,
} from '../../services/autorespond.js';

export default {
    data: new SlashCommandBuilder()
        .setName('autorespond')
        .setDescription('Manage automatic responses to trigger words/phrases')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addSubcommand(sub =>
            sub
                .setName('add')
                .setDescription('Add a new auto-response trigger')
                .addStringOption(opt =>
                    opt.setName('trigger')
                        .setDescription('The word or phrase that triggers the response')
                        .setRequired(true)
                        .setMaxLength(100))
                .addStringOption(opt =>
                    opt.setName('response')
                        .setDescription('The message the bot will reply with')
                        .setRequired(true)
                        .setMaxLength(1000))
                .addStringOption(opt =>
                    opt.setName('match')
                        .setDescription('How to match the trigger (default: whole word)')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Whole word — "hi" won\'t fire inside "anything" (default)', value: 'word' },
                            { name: 'Contains — fires anywhere inside a message', value: 'contains' },
                            { name: 'Exact — whole message must match exactly', value: 'exact' },
                            { name: 'Starts with — message must begin with trigger', value: 'startswith' },
                        )))
        .addSubcommand(sub =>
            sub
                .setName('remove')
                .setDescription('Remove an auto-response trigger')
                .addStringOption(opt =>
                    opt.setName('trigger')
                        .setDescription('The trigger word/phrase to remove')
                        .setRequired(true)
                        .setMaxLength(100)))
        .addSubcommand(sub =>
            sub
                .setName('list')
                .setDescription('List all auto-response triggers'))
        .addSubcommand(sub =>
            sub
                .setName('clear')
                .setDescription('Remove all auto-response triggers')),

    async execute(interaction) {
        const deferred = await InteractionHelper.safeDefer(interaction, { ephemeral: true });
        if (!deferred) return;

        const { options, guild, client } = interaction;
        const sub = options.getSubcommand();

        try {
            if (sub === 'add') {
                const trigger = options.getString('trigger');
                const response = options.getString('response');
                const matchType = options.getString('match') || 'contains';

                const result = await addAutorespond(client, guild.id, trigger, response, {
                    matchType,
                    createdBy: interaction.user.id,
                });

                if (!result.success) {
                    if (result.reason === 'DUPLICATE') {
                        return InteractionHelper.safeEditReply(interaction, {
                            embeds: [errorEmbed('Already Exists', `A trigger for **${trigger}** already exists. Remove it first if you want to change it.`)],
                        });
                    }
                    if (result.reason === 'MAX_LIMIT') {
                        return InteractionHelper.safeEditReply(interaction, {
                            embeds: [errorEmbed('Limit Reached', `This server has reached the maximum of **${result.max}** auto-responses.`)],
                        });
                    }
                }

                const matchLabel = { word: 'Whole word', contains: 'Contains', exact: 'Exact match', startswith: 'Starts with' }[matchType] || 'Whole word';
                return InteractionHelper.safeEditReply(interaction, {
                    embeds: [
                        new EmbedBuilder()
                            .setColor(getColor('success'))
                            .setTitle('Auto-Response Added')
                            .addFields(
                                { name: 'Trigger', value: `\`${trigger}\``, inline: true },
                                { name: 'Match Type', value: matchLabel, inline: true },
                                { name: 'Response', value: response },
                            )
                            .setFooter({ text: `Added by ${interaction.user.tag}` })
                            .setTimestamp(),
                    ],
                });
            }

            if (sub === 'remove') {
                const trigger = options.getString('trigger');
                const result = await removeAutorespond(client, guild.id, trigger);

                if (!result.success) {
                    return InteractionHelper.safeEditReply(interaction, {
                        embeds: [errorEmbed('Not Found', `No auto-response found for trigger **${trigger}**.`)],
                    });
                }

                return InteractionHelper.safeEditReply(interaction, {
                    embeds: [successEmbed('Removed', `Auto-response for **${trigger}** has been removed.`)],
                });
            }

            if (sub === 'list') {
                const autoresponds = await getAutoresponds(client, guild.id);

                if (!autoresponds.length) {
                    return InteractionHelper.safeEditReply(interaction, {
                        embeds: [
                            new EmbedBuilder()
                                .setColor(getColor('primary'))
                                .setTitle('Auto-Responses')
                                .setDescription('No auto-responses set up yet. Use `/autorespond add` to create one.')
                                .setTimestamp(),
                        ],
                    });
                }

                const matchLabel = { word: 'whole word', contains: 'contains', exact: 'exact', startswith: 'starts with' };
                const lines = autoresponds.map((r, i) =>
                    `**${i + 1}.** \`${r.trigger}\` (${matchLabel[r.matchType] || 'whole word'})\n↳ ${r.response.length > 80 ? r.response.slice(0, 80) + '…' : r.response}`
                );

                const embed = new EmbedBuilder()
                    .setColor(getColor('primary'))
                    .setTitle(`Auto-Responses (${autoresponds.length}/50)`)
                    .setDescription(lines.join('\n\n').slice(0, 4000))
                    .setTimestamp();

                return InteractionHelper.safeEditReply(interaction, { embeds: [embed] });
            }

            if (sub === 'clear') {
                const existing = await getAutoresponds(client, guild.id);
                if (!existing.length) {
                    return InteractionHelper.safeEditReply(interaction, {
                        embeds: [errorEmbed('Nothing to Clear', 'There are no auto-responses set up.')],
                    });
                }

                await clearAutoresponds(client, guild.id);
                return InteractionHelper.safeEditReply(interaction, {
                    embeds: [successEmbed('Cleared', `Removed all **${existing.length}** auto-response(s).`)],
                });
            }
        } catch (error) {
            logger.error('Error in autorespond command:', error);
            return InteractionHelper.safeEditReply(interaction, {
                embeds: [errorEmbed('Error', 'Something went wrong. Please try again.')],
            });
        }
    },
};
