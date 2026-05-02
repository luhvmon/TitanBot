import { SlashCommandBuilder, ActivityType, MessageFlags } from 'discord.js';
import { createEmbed } from '../../utils/embeds.js';
import { logger } from '../../utils/logger.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { botConfig } from '../../config/bot.js';

const ACTIVITY_TYPES = {
    playing: ActivityType.Playing,
    watching: ActivityType.Watching,
    listening: ActivityType.Listening,
    competing: ActivityType.Competing,
    custom: ActivityType.Custom,
};

export default {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Change the bot\'s activity status (owner only)')
        .addStringOption(opt =>
            opt.setName('text')
                .setDescription('The status text to display')
                .setRequired(true)
                .setMaxLength(128)
        )
        .addStringOption(opt =>
            opt.setName('type')
                .setDescription('Activity type (default: Watching)')
                .setRequired(false)
                .addChoices(
                    { name: 'Playing', value: 'playing' },
                    { name: 'Watching', value: 'watching' },
                    { name: 'Listening to', value: 'listening' },
                    { name: 'Competing in', value: 'competing' },
                    { name: 'Custom', value: 'custom' },
                )
        )
        .addStringOption(opt =>
            opt.setName('presence')
                .setDescription('Online presence (default: keep current)')
                .setRequired(false)
                .addChoices(
                    { name: '🟢 Online', value: 'online' },
                    { name: '🌙 Idle', value: 'idle' },
                    { name: '⛔ Do Not Disturb', value: 'dnd' },
                    { name: '⚫ Invisible', value: 'invisible' },
                )
        ),

    async execute(interaction) {
        try {
            const owners = botConfig.commands.owners;
            const isOwner =
                owners.includes(interaction.user.id) ||
                interaction.client.application?.owner?.id === interaction.user.id ||
                interaction.client.application?.owner?.members?.has(interaction.user.id);

            if (!isOwner) {
                return await InteractionHelper.safeReply(interaction, {
                    embeds: [createEmbed({
                        title: 'No Permission',
                        description: 'Only the bot owner can change the status.',
                        color: 'error',
                    })],
                    flags: MessageFlags.Ephemeral,
                });
            }

            const text = interaction.options.getString('text');
            const typeKey = interaction.options.getString('type') ?? 'watching';
            const presenceStatus = interaction.options.getString('presence') ?? null;

            const activityType = ACTIVITY_TYPES[typeKey];

            const presenceData = {
                activities: [{ name: text, type: activityType }],
            };
            if (presenceStatus) presenceData.status = presenceStatus;

            interaction.client.user.setPresence(presenceData);

            const typeLabel = typeKey.charAt(0).toUpperCase() + typeKey.slice(1);
            const presenceLabel = presenceStatus
                ? `\n**Presence:** ${presenceStatus}`
                : '';

            logger.info(`Status changed by ${interaction.user.tag}: [${typeLabel}] ${text}`);

            await InteractionHelper.safeReply(interaction, {
                embeds: [createEmbed({
                    title: '✅ Status Updated',
                    description: `**Type:** ${typeLabel}\n**Text:** ${text}${presenceLabel}`,
                    color: 'success',
                })],
                flags: MessageFlags.Ephemeral,
            });

        } catch (error) {
            logger.error('Status command error:', error);
            await InteractionHelper.safeReply(interaction, {
                embeds: [createEmbed({
                    title: 'Error',
                    description: 'Failed to update status.',
                    color: 'error',
                })],
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};
