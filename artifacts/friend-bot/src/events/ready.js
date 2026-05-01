import { Events } from 'discord.js';

export default {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`✅ Logged in as ${client.user.tag}`);
        console.log(`Serving ${client.guilds.cache.size} guild(s)`);
        client.user.setActivity('your server 👀', { type: 3 });
    },
};
