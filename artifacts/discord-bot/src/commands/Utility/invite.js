import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { getColor } from '../../utils/colors.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

const PERMISSIONS = [
    PermissionFlagsBits.ManageGuild,
    PermissionFlagsBits.ManageRoles,
    PermissionFlagsBits.ManageChannels,
    PermissionFlagsBits.KickMembers,
    PermissionFlagsBits.BanMembers,
    PermissionFlagsBits.ManageMessages,
    PermissionFlagsBits.EmbedLinks,
    PermissionFlagsBits.AttachFiles,
    PermissionFlagsBits.ReadMessageHistory,
    PermissionFlagsBits.UseExternalEmojis,
    PermissionFlagsBits.AddReactions,
    PermissionFlagsBits.Connect,
    PermissionFlagsBits.Speak,
    PermissionFlagsBits.ModerateMembers,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.ViewChannel,
];

const PERMISSIONS_INT = PERMISSIONS.reduce((acc, p) => acc | p, 0n);

export default {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Get a link to invite this bot to another server'),

    async execute(interaction) {
        const clientId = interaction.client.user.id;
        const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=${PERMISSIONS_INT}&scope=bot%20applications.commands`;

        const embed = new EmbedBuilder()
            .setColor(getColor('primary'))
            .setTitle(`Invite ${interaction.client.user.username}`)
            .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
            .setDescription(`Click the link below to add me to your server!\n\n🔗 **[Click here to invite](${inviteUrl})**`)
            .addFields(
                {
                    name: 'Included Permissions',
                    value: 'Manage server, roles, channels, messages · Kick & ban · Timeout · Music · Reactions & embeds',
                }
            )
            .setFooter({ text: 'You can adjust permissions during the invite process' })
            .setTimestamp();

        await InteractionHelper.safeDeferReply(interaction, { ephemeral: true });
        await InteractionHelper.safeEditReply(interaction, { embeds: [embed] });
    },
};
