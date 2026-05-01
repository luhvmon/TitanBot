import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags,
} from 'discord.js';
import { errorEmbed } from '../../utils/embeds.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { logger } from '../../utils/logger.js';

export default {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Make the bot send a message in a channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addStringOption(opt =>
            opt.setName('message')
                .setDescription('The message to send')
                .setRequired(true)
                .setMaxLength(2000))
        .addChannelOption(opt =>
            opt.setName('channel')
                .setDescription('Channel to send the message in (defaults to current channel)')
                .setRequired(false))
        .addBooleanOption(opt =>
            opt.setName('silent')
                .setDescription('Only you see the confirmation (default: true)')
                .setRequired(false)),

    async execute(interaction) {
        const deferred = await InteractionHelper.safeDefer(interaction, { ephemeral: true });
        if (!deferred) return;

        const { options, guild } = interaction;
        const text = options.getString('message');
        const targetChannel = options.getChannel('channel') || interaction.channel;

        try {
            if (!targetChannel.isTextBased()) {
                return InteractionHelper.safeEditReply(interaction, {
                    embeds: [errorEmbed('Invalid Channel', 'That channel cannot receive text messages.')],
                });
            }

            const botMember = guild.members.cache.get(interaction.client.user.id);
            if (!targetChannel.permissionsFor(botMember)?.has(PermissionFlagsBits.SendMessages)) {
                return InteractionHelper.safeEditReply(interaction, {
                    embeds: [errorEmbed('Missing Permission', `I don't have permission to send messages in ${targetChannel}.`)],
                });
            }

            await targetChannel.send({ content: text });

            return InteractionHelper.safeEditReply(interaction, {
                content: `Message sent in ${targetChannel}.`,
            });
        } catch (error) {
            logger.error('Error in /say command:', error);
            return InteractionHelper.safeEditReply(interaction, {
                embeds: [errorEmbed('Error', 'Failed to send the message. Please try again.')],
            });
        }
    },
};
