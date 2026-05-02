import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { getColor } from '../../utils/colors.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { getAutoRespondConfig, setAutoRespondConfig } from '../../services/autorespond.js';

export default {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Configure bot settings for this server')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommandGroup(group =>
            group
                .setName('autorespond')
                .setDescription('Auto-response settings')
                .addSubcommand(sub =>
                    sub
                        .setName('cooldown')
                        .setDescription('Set how long before the same trigger can fire again')
                        .addIntegerOption(opt =>
                            opt
                                .setName('seconds')
                                .setDescription('Cooldown in seconds (1–300). Default is 5.')
                                .setMinValue(1)
                                .setMaxValue(300)
                                .setRequired(true)
                        )
                )
                .addSubcommand(sub =>
                    sub
                        .setName('view')
                        .setDescription('View the current auto-response settings')
                )
        ),

    async execute(interaction, client) {
        await InteractionHelper.safeDeferReply(interaction, { ephemeral: true });

        const group = interaction.options.getSubcommandGroup();
        const sub = interaction.options.getSubcommand();

        if (group === 'autorespond') {
            if (sub === 'cooldown') {
                const seconds = interaction.options.getInteger('seconds');
                const result = await setAutoRespondConfig(client, interaction.guildId, {
                    cooldownMs: seconds * 1000,
                });

                if (!result.success) {
                    return InteractionHelper.safeEditReply(interaction, {
                        embeds: [
                            new EmbedBuilder()
                                .setColor(getColor('error'))
                                .setDescription('❌ Failed to save the setting. Please try again.'),
                        ],
                    });
                }

                return InteractionHelper.safeEditReply(interaction, {
                    embeds: [
                        new EmbedBuilder()
                            .setColor(getColor('success'))
                            .setTitle('✅ Cooldown Updated')
                            .setDescription(`Auto-response cooldown is now **${seconds} second${seconds === 1 ? '' : 's'}**.\nThe same trigger won't fire again within that window.`)
                            .setTimestamp(),
                    ],
                });
            }

            if (sub === 'view') {
                const config = await getAutoRespondConfig(client, interaction.guildId);
                const seconds = Math.round(config.cooldownMs / 1000);

                return InteractionHelper.safeEditReply(interaction, {
                    embeds: [
                        new EmbedBuilder()
                            .setColor(getColor('primary'))
                            .setTitle('⚙️ Auto-Response Settings')
                            .addFields(
                                { name: 'Cooldown', value: `${seconds} second${seconds === 1 ? '' : 's'}`, inline: true },
                            )
                            .setFooter({ text: 'Use /config autorespond cooldown to change the cooldown' })
                            .setTimestamp(),
                    ],
                });
            }
        }
    },
};
