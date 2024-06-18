import { ButtonBuilder, StringSelectMenuBuilder } from "@cosmosportal/blossom.utils";
import { ButtonStyle, EmbedBuilder, type Client, type MessageComponentInteraction } from "discord.js";
import { ActionType, Blossom, FormatMemberInfractions, Sentry, type InfractionType } from "../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: MessageComponentInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isButton() || !interaction.customId.startsWith("ViewInfractionHistory")) return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);

    await interaction.deferUpdate();

    const custom_id = interaction.customId.split("_");
    const type = custom_id[1] as InfractionType;
    const user = await client.users.fetch(custom_id[2]).catch(() => { return undefined });
    const is_inactive = custom_id[3] === "true" ? false : true;

    if (!user) return void await Blossom.CreateInteractionError(interaction, `An issue occured with fetching the user. The user either no longer exist or ${client.user.username} couldn't fetch the user.`);
    if (interaction.user.id !== user.id && !await Sentry.BlossomGuildModerationAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to members of the Moderation Team in ${interaction.guild.name}.`);

    const action_row_one = new ButtonBuilder()
    .CreateRegularButton({
        custom_id: "ExitInfractionHistory",
        style: ButtonStyle.Secondary,
        label: "Exit"
    })
    .CreateRegularButton({
        custom_id: `ExportInfractionData_${type}_${user.id}`,
        style: ButtonStyle.Secondary,
        label: "Export Data"
    })
    .CreateRegularButton({
        custom_id: `ViewInfractionHistory_${type}_${user.id}_${is_inactive}`,
        style: ButtonStyle.Secondary,
        label: `Show ${is_inactive ? "Active Only" : "Inactive"}`
    }).BuildActionRow();

    const action_row_two = new StringSelectMenuBuilder({
        custom_id: `ViewInfractionHistoryType_${user.id}_${is_inactive}`,
        select_options: [
            {
                label: "BanAdd",
                value: "BanAdd",
                default: type === "BanAdd"
            },
            {
                label: "BanRemove",
                value: "BanRemove",
                default: type === "BanRemove"
            },
            {
                label: "BanSoft",
                value: "BanSoft",
                default: type === "BanSoft"
            },
            {
                label: "Kick",
                value: "Kick",
                default: type === "Kick"
            },
            {
                label: "TimeoutAdd",
                value: "TimeoutAdd",
                default: type === "TimeoutAdd"
            },
            {
                label: "TimeoutRemove",
                value: "TimeoutRemove",
                default: type === "TimeoutRemove"
            },
            {
                label: "WarnAdd",
                value: "WarnAdd",
                default: type === "WarnAdd"
            }
        ],
        placeholder: "Infraction Types"
    }).BuildActionRow();

    const infraction_history = await FormatMemberInfractions(interaction.guild.id, user.id, type, is_inactive);
    if (!infraction_history) return void await Blossom.CreateInteractionError(interaction, `The user doesn't have any ${ActionType[type].toLowerCase()} action IDs that exist.`);

    const embed_one = new EmbedBuilder()
    .setThumbnail(user.displayAvatarURL({ forceStatic: false, size: 4096 }))
    .setDescription(infraction_history)
    .setColor(Blossom.DefaultHex());

    return void await interaction.editReply({ embeds: [embed_one], components: [action_row_one, action_row_two] });
};