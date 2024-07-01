import { ButtonBuilder } from "@cosmosportal/blossom.utils";
import { ButtonStyle, EmbedBuilder, type Client, type MessageComponentInteraction } from "discord.js";
import { Blossom, FormatTag, Sentry } from "../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: MessageComponentInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isButton() || !interaction.customId.startsWith("ViewTagsGuildList")) return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.HasManagementAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to members of the Management Team in ${interaction.guild.name}.`);

    await interaction.deferUpdate();

    const custom_id = interaction.customId.split("_");
    const staff_only = custom_id[1] === "true" ? false : true;

    const action_row_one = new ButtonBuilder()
    .CreateRegularButton({
        custom_id: "ExitTagsGuildList",
        style: ButtonStyle.Secondary,
        label: "Exit"
    })
    .CreateRegularButton({
        custom_id: "ExportTagsGuildData",
        style: ButtonStyle.Secondary,
        label: "Export Data"
    })
    .CreateRegularButton({
        custom_id: `ViewTagsGuildList_${staff_only}`,
        style: ButtonStyle.Secondary,
        label: `Show ${staff_only ? "All" : "Staff Only"}`
    }).BuildActionRow();

    const tags = await FormatTag(interaction.guild.id, {
        staff_only: staff_only
    });
    if (!tags) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} doesn't have any tags that exist.`);

    const embed_one = new EmbedBuilder()
    .setThumbnail(interaction.guild.iconURL({ forceStatic: false, size: 4096 }))
    .setDescription(tags)
    .setColor(Blossom.DefaultHex());

    return void await interaction.editReply({ embeds: [embed_one], components: [action_row_one] });
};