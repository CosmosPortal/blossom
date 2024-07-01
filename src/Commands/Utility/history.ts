import { ButtonBuilder, ChatInputCommandBuilder, StringSelectMenuBuilder } from "@cosmosportal/blossom.utils";
import { ApplicationCommandOptionType, ButtonStyle, EmbedBuilder } from "discord.js";
import { ActionName, Blossom, FormatInfraction, Sentry, type InfractionType } from "../../Core";
import type { CommandData, SlashCommandProps } from "commandkit";

export const data: CommandData = new ChatInputCommandBuilder({
    name: "history",
    description: "Searches a profile for all action IDs for a certain infraction",
    options: [
        {
            name: "type",
            description: "The type of infraction to view",
            type: ApplicationCommandOptionType.String,
            choices: [
                { name: "Ban Add", value: "BanAdd" },
                { name: "Ban Remove", value: "BanRemove" },
                { name: "Ban Soft", value: "BanSoft" },
                { name: "Kick", value: "Kick" },
                { name: "Timeout Add", value: "TimeoutAdd" },
                { name: "Timeout Remove", value: "TimeoutRemove" },
                { name: "Verbal Warn", value: "WarnVerbal" },
                { name: "Warn Add", value: "WarnAdd" }
            ],
            required: true
        },
        {
            name: "is_inactive",
            description: "If true, returns inactive action IDs as well",
            type: ApplicationCommandOptionType.Boolean
        },
        {
            name: "user",
            description: "The user to search",
            type: ApplicationCommandOptionType.User
        }
    ],
    dm_permission: false
}).BuildCommand();

export async function run({ client, handler, interaction }: SlashCommandProps): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isChatInputCommand()) return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);

    const user = interaction.options.getUser("user", false) ?? interaction.user;
    await interaction.deferReply({ ephemeral: true });

    const action_row_one = new ButtonBuilder()
    .CreateRegularButton({
        custom_id: "ExitInfractionHistory",
        style: ButtonStyle.Secondary,
        label: "Exit"
    })
    .CreateRegularButton({
        custom_id: `ExportInfractionData_${interaction.options.getString("type", true)}_${user.id}`,
        style: ButtonStyle.Secondary,
        label: "Export Data"
    })
    .CreateRegularButton({
        custom_id: `ViewInfractionHistory_${interaction.options.getString("type", true)}_${user.id}_${interaction.options.getBoolean("is_inactive", false) ?? false}`,
        style: ButtonStyle.Secondary,
        label: `Show ${interaction.options.getBoolean("is_inactive", false) ? "Active Only" : "Inactive"}`
    }).BuildActionRow();

    const action_row_two = new StringSelectMenuBuilder({
        custom_id: `ViewInfractionHistoryType_${user.id}_${interaction.options.getBoolean("is_inactive", false) ?? false}`,
        select_options: [
            {
                label: "BanAdd",
                value: "BanAdd",
                default: interaction.options.getString("type", true) === "BanAdd"
            },
            {
                label: "BanRemove",
                value: "BanRemove",
                default: interaction.options.getString("type", true) === "BanRemove"
            },
            {
                label: "BanSoft",
                value: "BanSoft",
                default: interaction.options.getString("type", true) === "BanSoft"
            },
            {
                label: "Kick",
                value: "Kick",
                default: interaction.options.getString("type", true) === "Kick"
            },
            {
                label: "TimeoutAdd",
                value: "TimeoutAdd",
                default: interaction.options.getString("type", true) === "TimeoutAdd"
            },
            {
                label: "TimeoutRemove",
                value: "TimeoutRemove",
                default: interaction.options.getString("type", true) === "TimeoutRemove"
            },
            {
                label: "WarnAdd",
                value: "WarnAdd",
                default: interaction.options.getString("type", true) === "WarnAdd"
            }
        ],
        placeholder: "Infraction Types"
    }).BuildActionRow();

    if (user.id === interaction.user.id) {
        const infractions = await FormatInfraction(interaction.guild.id, {
            from_member: user.id,
            is_inactive: interaction.options.getBoolean("is_inactive", false) ?? false,
            type: interaction.options.getString("type", true) as InfractionType
        })
        if (!infractions) return void await Blossom.CreateInteractionError(interaction, `You don't have any ${ActionName[interaction.options.getString("type", true) as InfractionType].toLowerCase()} infraction IDs that exist. To view inactive infraction IDs, make sure \`is_inactive\` option is toggle to \`true\`. To view another user infraction IDs, make sure to mention/enter user ID in the \`user\` option.`);

        const embed_one = new EmbedBuilder()
        .setThumbnail(user.displayAvatarURL({ forceStatic: false, size: 4096 }))
        .setDescription(infractions)
        .setColor(Blossom.DefaultHex());

        return void await interaction.followUp({ embeds: [embed_one], components: [action_row_one, action_row_two], ephemeral: true });
    };

    if (user.id !== interaction.user.id) {
        if (!await Sentry.HasModerationAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `</${interaction.commandName}:${interaction.commandId}> \`user\` option is restricted to members of the Moderation Team in ${interaction.guild.name}.`);

        const infractions = await FormatInfraction(interaction.guild.id, {
            from_member: user.id,
            is_inactive: interaction.options.getBoolean("is_inactive", false) ?? false,
            type: interaction.options.getString("type", true) as InfractionType
        });
        if (!infractions) return void await Blossom.CreateInteractionError(interaction, `The user you entered doesn't have any ${ActionName[interaction.options.getString("type", true) as InfractionType].toLowerCase()} infraction IDs that exist. To view inactive infraction IDs, make sure \`is_inactive\` option is toggle to \`true\`.`);

        const embed_one = new EmbedBuilder()
        .setThumbnail(user.displayAvatarURL({ forceStatic: false, size: 4096 }))
        .setDescription(infractions)
        .setColor(Blossom.DefaultHex());

        return void await interaction.followUp({ embeds: [embed_one], components: [action_row_one, action_row_two], ephemeral: true });
    };
};