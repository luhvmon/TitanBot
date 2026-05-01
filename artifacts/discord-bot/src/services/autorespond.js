import { logger } from '../utils/logger.js';

const MAX_TRIGGERS_PER_GUILD = 50;

function getKey(guildId) {
    return `guild:${guildId}:autoresponds`;
}

export async function getAutoresponds(client, guildId) {
    try {
        const data = await client.db.get(getKey(guildId), []);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        logger.error('Failed to get autoresponds:', error);
        return [];
    }
}

export async function addAutorespond(client, guildId, trigger, response, options = {}) {
    const existing = await getAutoresponds(client, guildId);

    if (existing.length >= MAX_TRIGGERS_PER_GUILD) {
        return { success: false, reason: 'MAX_LIMIT', max: MAX_TRIGGERS_PER_GUILD };
    }

    const normalizedTrigger = trigger.toLowerCase().trim();
    const duplicate = existing.find(r => r.trigger === normalizedTrigger);
    if (duplicate) {
        return { success: false, reason: 'DUPLICATE' };
    }

    const entry = {
        id: Date.now().toString(),
        trigger: normalizedTrigger,
        response: response.trim(),
        matchType: options.matchType || 'word',
        createdBy: options.createdBy || null,
        createdAt: new Date().toISOString(),
    };

    existing.push(entry);
    await client.db.set(getKey(guildId), existing);
    return { success: true, entry };
}

export async function removeAutorespond(client, guildId, trigger) {
    const existing = await getAutoresponds(client, guildId);
    const normalizedTrigger = trigger.toLowerCase().trim();
    const index = existing.findIndex(r => r.trigger === normalizedTrigger);

    if (index === -1) {
        return { success: false, reason: 'NOT_FOUND' };
    }

    existing.splice(index, 1);
    await client.db.set(getKey(guildId), existing);
    return { success: true };
}

export async function clearAutoresponds(client, guildId) {
    await client.db.set(getKey(guildId), []);
    return { success: true };
}

export async function findMatchingAutorespond(client, guildId, content) {
    const autoresponds = await getAutoresponds(client, guildId);
    if (!autoresponds.length) return null;

    const lower = content.toLowerCase();
    return autoresponds.find(r => {
        if (r.matchType === 'exact') return lower === r.trigger;
        if (r.matchType === 'startswith') return lower.startsWith(r.trigger);
        if (r.matchType === 'contains') return lower.includes(r.trigger);
        const escaped = r.trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`\\b${escaped}\\b`, 'i').test(content);
    }) || null;
}
