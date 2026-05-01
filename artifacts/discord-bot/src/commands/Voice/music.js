import {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
} from 'discord.js';
import { getColor } from '../../config/bot.js';
import { errorEmbed, successEmbed } from '../../utils/embeds.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { logger } from '../../utils/logger.js';
import {
    addTrack,
    skipTrack,
    stopMusic,
    pauseMusic,
    resumeMusic,
    getQueueInfo,
    toggleLoop,
} from '../../services/musicPlayer.js';

export default {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('Music player — play songs in your voice channel')
        .addSubcommand(sub =>
            sub.setName('play')
                .setDescription('Play a song or add it to the queue')
                .addStringOption(opt =>
                    opt.setName('query')
                        .setDescription('Song name or YouTube URL')
                        .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('skip')
                .setDescription('Skip the current song'))
        .addSubcommand(sub =>
            sub.setName('stop')
                .setDescription('Stop music and clear the queue'))
        .addSubcommand(sub =>
            sub.setName('pause')
                .setDescription('Pause the current song'))
        .addSubcommand(sub =>
            sub.setName('resume')
                .setDescription('Resume the paused song'))
        .addSubcommand(sub =>
            sub.setName('queue')
                .setDescription('View the current song queue'))
        .addSubcommand(sub =>
            sub.setName('nowplaying')
                .setDescription('Show what is currently playing'))
        .addSubcommand(sub =>
            sub.setName('loop')
                .setDescription('Toggle looping the current song')),

    async execute(interaction) {
        const deferred = await InteractionHelper.safeDefer(interaction);
        if (!deferred) return;

        const { options, guild, member } = interaction;
        const sub = options.getSubcommand();

        const voiceChannel = member.voice?.channel;

        if (['play', 'skip', 'stop', 'pause', 'resume', 'loop'].includes(sub)) {
            if (!voiceChannel) {
                return InteractionHelper.safeEditReply(interaction, {
                    embeds: [errorEmbed('Not in Voice', 'You need to be in a voice channel to use music commands.')],
                });
            }

            const botMember = guild.members.cache.get(interaction.client.user.id);
            if (!voiceChannel.permissionsFor(botMember)?.has(PermissionFlagsBits.Connect)) {
                return InteractionHelper.safeEditReply(interaction, {
                    embeds: [errorEmbed('Missing Permission', "I don't have permission to join your voice channel.")],
                });
            }
        }

        try {
            if (sub === 'play') {
                const query = options.getString('query');

                await InteractionHelper.safeEditReply(interaction, {
                    embeds: [
                        new EmbedBuilder()
                            .setColor(getColor('primary'))
                            .setDescription(`🔍 Searching for **${query}**...`),
                    ],
                });

                const result = await addTrack(guild, voiceChannel, interaction.channel, query);

                if (!result.success) {
                    const reason = result.reason === 'NO_RESULTS'
                        ? 'No results found for that query.'
                        : 'Failed to search for the track. Please try again.';
                    return InteractionHelper.safeEditReply(interaction, {
                        embeds: [errorEmbed('Search Failed', reason)],
                    });
                }

                const { track, playing } = result;
                const embed = new EmbedBuilder()
                    .setColor(getColor('primary'))
                    .setTitle(playing ? '🎵 Now Playing' : '📋 Added to Queue')
                    .setDescription(`[${track.title}](${track.url})`)
                    .addFields({ name: 'Duration', value: track.duration, inline: true });

                if (track.thumbnail) embed.setThumbnail(track.thumbnail);

                return InteractionHelper.safeEditReply(interaction, { embeds: [embed] });
            }

            if (sub === 'skip') {
                const result = skipTrack(guild.id);
                if (!result.success) {
                    return InteractionHelper.safeEditReply(interaction, {
                        embeds: [errorEmbed('Nothing Playing', 'There is nothing to skip.')],
                    });
                }
                return InteractionHelper.safeEditReply(interaction, {
                    embeds: [successEmbed('Skipped', `Skipped **${result.skipped.title}**.`)],
                });
            }

            if (sub === 'stop') {
                const result = stopMusic(guild.id);
                if (!result.success) {
                    return InteractionHelper.safeEditReply(interaction, {
                        embeds: [errorEmbed('Nothing Playing', 'There is nothing playing.')],
                    });
                }
                return InteractionHelper.safeEditReply(interaction, {
                    embeds: [successEmbed('Stopped', 'Music stopped and queue cleared.')],
                });
            }

            if (sub === 'pause') {
                const result = pauseMusic(guild.id);
                if (!result.success) {
                    return InteractionHelper.safeEditReply(interaction, {
                        embeds: [errorEmbed('Cannot Pause', result.reason === 'ALREADY_PAUSED' ? 'Already paused.' : 'Nothing is playing.')],
                    });
                }
                return InteractionHelper.safeEditReply(interaction, {
                    embeds: [successEmbed('Paused', 'Music paused. Use `/music resume` to continue.')],
                });
            }

            if (sub === 'resume') {
                const result = resumeMusic(guild.id);
                if (!result.success) {
                    return InteractionHelper.safeEditReply(interaction, {
                        embeds: [errorEmbed('Cannot Resume', result.reason === 'NOT_PAUSED' ? 'Music is not paused.' : 'Nothing is playing.')],
                    });
                }
                return InteractionHelper.safeEditReply(interaction, {
                    embeds: [successEmbed('Resumed', 'Music resumed.')],
                });
            }

            if (sub === 'loop') {
                const result = toggleLoop(guild.id);
                if (!result.success) {
                    return InteractionHelper.safeEditReply(interaction, {
                        embeds: [errorEmbed('Nothing Playing', 'Nothing is playing to loop.')],
                    });
                }
                return InteractionHelper.safeEditReply(interaction, {
                    embeds: [successEmbed('Loop', `Loop is now **${result.loop ? 'enabled' : 'disabled'}**.`)],
                });
            }

            if (sub === 'queue') {
                const info = getQueueInfo(guild.id);
                if (!info || (!info.current && !info.tracks.length)) {
                    return InteractionHelper.safeEditReply(interaction, {
                        embeds: [
                            new EmbedBuilder()
                                .setColor(getColor('primary'))
                                .setTitle('Queue')
                                .setDescription('The queue is empty. Use `/music play` to add a song.'),
                        ],
                    });
                }

                const lines = [];
                if (info.current) {
                    lines.push(`**Now Playing:** [${info.current.title}](${info.current.url}) \`${info.current.duration}\``);
                }
                if (info.tracks.length) {
                    lines.push('');
                    lines.push('**Up Next:**');
                    info.tracks.slice(0, 10).forEach((t, i) => {
                        lines.push(`${i + 1}. [${t.title}](${t.url}) \`${t.duration}\``);
                    });
                    if (info.tracks.length > 10) {
                        lines.push(`_...and ${info.tracks.length - 10} more_`);
                    }
                }

                const embed = new EmbedBuilder()
                    .setColor(getColor('primary'))
                    .setTitle(`Queue — ${info.tracks.length + (info.current ? 1 : 0)} track(s)${info.loop ? ' 🔁' : ''}`)
                    .setDescription(lines.join('\n').slice(0, 4000));

                return InteractionHelper.safeEditReply(interaction, { embeds: [embed] });
            }

            if (sub === 'nowplaying') {
                const info = getQueueInfo(guild.id);
                if (!info?.current) {
                    return InteractionHelper.safeEditReply(interaction, {
                        embeds: [errorEmbed('Nothing Playing', 'Nothing is currently playing.')],
                    });
                }

                const embed = new EmbedBuilder()
                    .setColor(getColor('primary'))
                    .setTitle('🎵 Now Playing')
                    .setDescription(`[${info.current.title}](${info.current.url})`)
                    .addFields({ name: 'Duration', value: info.current.duration, inline: true });

                if (info.current.thumbnail) embed.setThumbnail(info.current.thumbnail);

                return InteractionHelper.safeEditReply(interaction, { embeds: [embed] });
            }

        } catch (error) {
            logger.error('Error in /music command:', error);
            return InteractionHelper.safeEditReply(interaction, {
                embeds: [errorEmbed('Error', 'Something went wrong with the music player. Please try again.')],
            });
        }
    },
};
