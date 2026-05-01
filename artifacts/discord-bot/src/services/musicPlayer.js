import {
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    entersState,
    getVoiceConnection,
    NoSubscriberBehavior,
} from '@discordjs/voice';
import play from 'play-dl';
import { logger } from '../utils/logger.js';

const queues = new Map();

function getQueue(guildId) {
    return queues.get(guildId) || null;
}

function createQueue(guild, voiceChannel, textChannel) {
    const player = createAudioPlayer({
        behaviors: { noSubscriber: NoSubscriberBehavior.Pause },
    });

    const queue = {
        guild,
        voiceChannel,
        textChannel,
        player,
        connection: null,
        tracks: [],
        current: null,
        loop: false,
        volume: 100,
    };

    queues.set(guild.id, queue);
    return queue;
}

function destroyQueue(guildId) {
    const queue = queues.get(guildId);
    if (!queue) return;
    try {
        queue.player.stop(true);
        const conn = getVoiceConnection(guildId);
        if (conn) conn.destroy();
    } catch (_) {}
    queues.delete(guildId);
}

async function connectToChannel(queue) {
    const connection = joinVoiceChannel({
        channelId: queue.voiceChannel.id,
        guildId: queue.guild.id,
        adapterCreator: queue.guild.voiceAdapterCreator,
    });

    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 15_000);
    } catch (err) {
        connection.destroy();
        throw new Error('Could not connect to voice channel.');
    }

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
        try {
            await Promise.race([
                entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
            ]);
        } catch {
            destroyQueue(queue.guild.id);
        }
    });

    queue.connection = connection;
    connection.subscribe(queue.player);
    return connection;
}

async function playNext(queue) {
    if (!queue.tracks.length) {
        queue.current = null;
        setTimeout(() => {
            const q = queues.get(queue.guild.id);
            if (q && !q.current && !q.tracks.length) {
                destroyQueue(queue.guild.id);
            }
        }, 60_000);
        return;
    }

    const track = queue.tracks.shift();
    queue.current = track;

    try {
        const stream = await play.stream(track.url, { quality: 2 });
        const resource = createAudioResource(stream.stream, {
            inputType: stream.type,
        });

        queue.player.play(resource);
    } catch (err) {
        logger.error(`Music: failed to stream ${track.url}:`, err);
        queue.current = null;
        playNext(queue);
    }
}

export async function addTrack(guild, voiceChannel, textChannel, query) {
    let queue = getQueue(guild.id);
    if (!queue) {
        queue = createQueue(guild, voiceChannel, textChannel);
        queue.player.on(AudioPlayerStatus.Idle, () => {
            if (queue.loop && queue.current) {
                queue.tracks.unshift(queue.current);
            }
            playNext(queue);
        });
        queue.player.on('error', (err) => {
            logger.error('Music player error:', err);
            playNext(queue);
        });
        await connectToChannel(queue);
    }

    let searchResults;
    try {
        if (play.yt_validate(query) === 'video') {
            const info = await play.video_info(query);
            searchResults = [info.video_details];
        } else {
            const results = await play.search(query, { limit: 1, source: { youtube: 'video' } });
            if (!results.length) return { success: false, reason: 'NO_RESULTS' };
            searchResults = results;
        }
    } catch (err) {
        logger.error('Music search error:', err);
        return { success: false, reason: 'SEARCH_ERROR' };
    }

    const video = searchResults[0];
    const track = {
        title: video.title,
        url: video.url,
        duration: video.durationRaw || '?',
        thumbnail: video.thumbnails?.[0]?.url || null,
        requestedBy: null,
    };

    queue.tracks.push(track);

    if (queue.player.state.status === AudioPlayerStatus.Idle) {
        await playNext(queue);
        return { success: true, track, playing: true };
    }

    return { success: true, track, playing: false };
}

export function skipTrack(guildId) {
    const queue = getQueue(guildId);
    if (!queue || !queue.current) return { success: false, reason: 'NOTHING_PLAYING' };
    queue.player.stop();
    return { success: true, skipped: queue.current };
}

export function stopMusic(guildId) {
    const queue = getQueue(guildId);
    if (!queue) return { success: false, reason: 'NOTHING_PLAYING' };
    queue.tracks = [];
    destroyQueue(guildId);
    return { success: true };
}

export function pauseMusic(guildId) {
    const queue = getQueue(guildId);
    if (!queue || !queue.current) return { success: false, reason: 'NOTHING_PLAYING' };
    const paused = queue.player.pause();
    return { success: paused, reason: paused ? null : 'ALREADY_PAUSED' };
}

export function resumeMusic(guildId) {
    const queue = getQueue(guildId);
    if (!queue || !queue.current) return { success: false, reason: 'NOTHING_PLAYING' };
    const resumed = queue.player.unpause();
    return { success: resumed, reason: resumed ? null : 'NOT_PAUSED' };
}

export function getQueueInfo(guildId) {
    const queue = getQueue(guildId);
    if (!queue) return null;
    return {
        current: queue.current,
        tracks: [...queue.tracks],
        loop: queue.loop,
    };
}

export function toggleLoop(guildId) {
    const queue = getQueue(guildId);
    if (!queue) return { success: false, reason: 'NOTHING_PLAYING' };
    queue.loop = !queue.loop;
    return { success: true, loop: queue.loop };
}
