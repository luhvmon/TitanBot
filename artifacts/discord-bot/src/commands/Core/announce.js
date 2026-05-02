import { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } from 'discord.js';
import { createEmbed } from '../../utils/embeds.js';
import { logger } from '../../utils/logger.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { botConfig } from '../../config/bot.js';

export default {
    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('Send an announcement to a channel (owner only)')
        .addChannelOption(opt =>
            opt.setName('channel')
                .setDescription('The channel to send the announcement to')
                .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName('message')
                .setDescription('The announcement message')
                .setRequired(true)
                .setMaxLength(3900)
        )
        .addStringOption(opt =>
            opt.setName('title')
                .setDescription('Optional title for the announcement')
                .setRequired(false)
                .setMaxLength(256)
        )
        .addStringOption(opt =>
            opt.setName('color')
                .setDescription('Embed color (default: primary)')
                .setRequired(false)
                .addChoices(
                    { name: 'Default', value: 'primary' },
                    { name: 'Red', value: 'error' },
                    { name: 'Green', value: 'success' },
                    { name: 'Yellow', value: 'warning' },
                    { name: 'Blue', value: 'info' },
                )
        )
        .addBooleanOption(opt =>
            opt.setName('ping')
                .setDescription('Ping @everyone with the announcement?')
                .setRequired(false)
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
                        description: 'Only the bot owner can send announcements.',
                        color: 'error',
                    })],
                    flags: MessageFlags.Ephemeral,
                });
            }

            const channel = interaction.options.getChannel('channel');
            const message = interaction.options.getString('message');
            const title = interaction.options.getString('title') ?? '';
            const color = interaction.options.getString('color') ?? 'primary';
            const ping = interaction.options.getBoolean('ping') ?? false;

            if (!channel.isTextBased()) {
                return await InteractionHelper.safeReply(interaction, {
                    embeds: [createEmbed({
                        title: 'Invalid Channel',
                        description: 'Please select a text channel.',
                        color: 'error',
                    })],
                    flags: MessageFlags.Ephemeral,
                });
            }

            const botMember = interaction.guild.members.me;
            if (!channel.permissionsFor(botMember).has(PermissionFlagsBits.SendMessages)) {
                return await InteractionHelper.safeReply(interaction, {
                    embeds: [createEmbed({
                        title: 'Missing Permissions',
                        description: `I don't have permission to send messages in ${channel}.`,
                        color: 'error',
                    })],
                    flags: MessageFlags.Ephemeral,
                });
            }

            const embed = createEmbed({
                title: title || null,
                description: message,
                color,
                footer: `Announcement by ${interaction.user.username}`,
            });

            await channel.send({
                content: ping ? '@everyone' : null,
                embeds: [embed],
            });

            logger.info(`Announcement sent to #${channel.name} by ${interaction.user.tag}`);

            await InteractionHelper.safeReply(interaction, {
                embeds: [createEmbed({
                    title: '✅ Announcement Sent',
                    description: `Your announcement was sent to ${channel}.`,
                    color: 'success',
                })],
                flags: MessageFlags.Ephemeral,
            });

        } catch (error) {
            logger.error('Announce command error:', error);
            await InteractionHelper.safeReply(interaction, {
                embeds: [createEmbed({
                    title: 'Error',
                    description: 'Failed to send the announcement.',
                    color: 'error',
                })],
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};
