import { ButtonBuilder, StringSelectMenuBuilder } from "@cosmosportal/blossom.utils";
import { ButtonStyle, EmbedBuilder, type Client, type MessageComponentInteraction } from "discord.js";
import { ActionName, Blossom, FormatInfraction, Sentry, type InfractionType } from "../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: MessageComponentInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isStringSelectMenu() || !interaction.customId.startsWith("ViewInfractionGuildHistoryType")) return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.HasManagementAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to members of the Management Team in ${interaction.guild.name}.`);

    await interaction.deferUpdate();

    const custom_id = interaction.customId.split("_");
    const type = interaction.values[0] as InfractionType;
    const is_inactive = custom_id[2] === "true" ? false : true;

    const action_row_one = new ButtonBuilder()
    .CreateRegularButton({
        custom_id: "ExitInfractionGuildHistory",
        style: ButtonStyle.Secondary,
        label: "Exit"
    })
    .CreateRegularButton({
        custom_id: `ExportInfractionGuildData_${type}`,
        style: ButtonStyle.Secondary,
        label: "Export Data"
    })
    .CreateRegularButton({
        custom_id: `ViewInfractionGuildHistory_${type}_${is_inactive}`,
        style: ButtonStyle.Secondary,
        label: `Show ${is_inactive ? "Active Only" : "Inactive"}`
    }).BuildActionRow();

    const action_row_two = new StringSelectMenuBuilder({
        custom_id: `ViewInfractionGuildHistoryType_${is_inactive}`,
        select_options: [
            {
                label: "Ban Add",
                value: "BanAdd",
                default: type === "BanAdd"
            },
            {
                label: "Ban Remove",
                value: "BanRemove",
                default: type === "BanRemove"
            },
            {
                label: "Ban Soft",
                value: "BanSoft",
                default: type === "BanSoft"
            },
            {
                label: "Kick",
                value: "Kick",
                default: type === "Kick"
            },
            {
                label: "Timeout Add",
                value: "TimeoutAdd",
                default: type === "TimeoutAdd"
            },
            {
                label: "Timeout Remove",
                value: "TimeoutRemove",
                default: type === "TimeoutRemove"
            },
            {
                label: "Verbal Warn",
                value: "WarnVerbal",
                default: type === "WarnVerbal"
            },
            {
                label: "Warn Add",
                value: "WarnAdd",
                default: type === "WarnAdd"
            }
        ],
        placeholder: "Infraction Types"
    }).BuildActionRow();

    const infractions = await FormatInfraction(interaction.guild.id, {
        is_inactive: is_inactive,
        type: type
    });
    if (!infractions) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} doesn't have any ${ActionName[type].toLowerCase()} infraction IDs that exist.`);

    const embed_one = new EmbedBuilder()
    .setThumbnail(interaction.guild.iconURL({ forceStatic: false, size: 4096 }))
    .setDescription(infractions)
    .setColor(Blossom.DefaultHex());

    return void await interaction.editReply({ embeds: [embed_one], components: [action_row_one, action_row_two] });
};