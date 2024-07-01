import { ButtonBuilder } from "@cosmosportal/blossom.utils";
import { ButtonStyle, EmbedBuilder, type Client, type MessageComponentInteraction } from "discord.js";
import { setTimeout } from "timers/promises";
import { ActionName, Blossom, FindOneEntity, ReportSystem, Sentry, UpdateEntity, type ReportType } from "../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: MessageComponentInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isButton() || interaction.customId !== "ExitReportSystem") return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.HasModerationAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to members of the Moderation Team in ${interaction.guild.name}.`);

    if (!interaction.message) return void await Blossom.CreateInteractionError(interaction, `An issue occured with fetching the message. The message either no longer exist or ${client.user.username} couldn't fetch the message.`)

    const report_system = await FindOneEntity(ReportSystem, { Guild_ID: interaction.guild.id, ReportMessageID: interaction.message.id });
    if (!report_system) return void await Blossom.CreateInteractionError(interaction, `I couldn't find the report information. This could be due to the report no longer existing in ${client.user.username}'s database.`);
    if (!report_system.Active) return void await Blossom.CreateInteractionError(interaction, "This report has been marked as inactive already.");

    await interaction.deferUpdate();

    const creation_timestamp = Date.now()
    await UpdateEntity(ReportSystem, { Guild_ID: interaction.guild.id, ReportMessageID: interaction.message.id }, { Active: false });

    const embed_one = new EmbedBuilder()
    .setThumbnail(interaction.message.embeds[0].thumbnail?.url ?? null)
    .setAuthor({ name: `Case #${report_system.CaseID} | ${ActionName[report_system.Type as ReportType]}` })
    .setDescription(interaction.message.embeds[0].description)
    .addFields(
        { name: "Reason", value: interaction.message.embeds[0].fields[0].value },
        { name: "Action Log", value: interaction.message.embeds[0].fields[1].value === "None" ? `- <@${interaction.user.id}> **closed the report** | <t:${Math.trunc(Math.floor(creation_timestamp / 1000))}:R>` : `${interaction.message.embeds[0].fields[1].value}\n- <@${interaction.user.id}> **closed the report** | <t:${Math.trunc(Math.floor(creation_timestamp / 1000))}:R>` }
    )
    .setImage(interaction.message.embeds[0].image?.url ?? null)
    .setFooter({ text: interaction.message.embeds[0].footer?.text ?? "An issue occured" })
    .setColor(Blossom.DefaultHex());

    const action_row_one = new ButtonBuilder()
    .CreateRegularButton({
        custom_id: "ViewReportSystemUserInfo",
        style: ButtonStyle.Secondary,
        label: "User Info"
    }).BuildActionRow();

    await interaction.editReply({ content: interaction.message.content, embeds: [embed_one], components: [action_row_one], allowedMentions: { parse: [ "roles" ] } });
    await setTimeout(300);
    return void await interaction.followUp({ content: `The ${ActionName[report_system.Type as ReportType].toLowerCase()} was closed in **${interaction.guild.name}**!`, ephemeral: true });
};