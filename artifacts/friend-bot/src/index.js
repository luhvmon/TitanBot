import 'dotenv/config';
import { Client, Collection, GatewayIntentBits, REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

client.commands = new Collection();

async function loadCommands() {
    const commandsPath = path.join(__dirname, 'commands');
    const categories = readdirSync(commandsPath);
    const commands = [];

    for (const category of categories) {
        const files = readdirSync(path.join(commandsPath, category)).filter(f => f.endsWith('.js'));
        for (const file of files) {
            const filePath = path.join(commandsPath, category, file);
            const mod = await import(pathToFileURL(filePath).href);
            const command = mod.default;
            if (command?.data && command?.execute) {
                client.commands.set(command.data.name, command);
                commands.push(command.data.toJSON());
            }
        }
    }
    return commands;
}

async function loadEvents() {
    const eventsPath = path.join(__dirname, 'events');
    const files = readdirSync(eventsPath).filter(f => f.endsWith('.js'));
    for (const file of files) {
        const filePath = path.join(eventsPath, file);
        const mod = await import(pathToFileURL(filePath).href);
        const event = mod.default;
        if (event?.name) {
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
            }
        }
    }
}

async function registerCommands(commands) {
    const rest = new REST({ version: '10' }).setToken(process.env.FRIEND_BOT_TOKEN);
    try {
        await rest.put(
            Routes.applicationGuildCommands(process.env.FRIEND_BOT_CLIENT_ID, process.env.FRIEND_BOT_GUILD_ID),
            { body: commands }
        );
        console.log(`✅ Registered ${commands.length} commands`);
    } catch (err) {
        console.error('Failed to register commands:', err);
    }
}

async function start() {
    console.log('Starting friend bot...');
    const commands = await loadCommands();
    await loadEvents();
    await client.login(process.env.FRIEND_BOT_TOKEN);
    await registerCommands(commands);
}

start().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
