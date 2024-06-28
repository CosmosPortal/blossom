import { ButtonBuilder, StringSelectMenuBuilder } from "@cosmosportal/blossom.utils";
import { ButtonStyle, EmbedBuilder, type Client, type MessageComponentInteraction } from "discord.js";
import { Blossom, FindOrCreateEntity, ReportSetting, Sentry, UpdateEntity } from "../../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: MessageComponentInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isStringSelectMenu() || interaction.customId !== "EditReportSystemToggle") return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.HasGuildSettingAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to members of the Management Team in ${interaction.guild.name}.`);

    await interaction.deferUpdate();

    for (const value of interaction.values) {
        const report_setting = await FindOrCreateEntity(ReportSetting, { Snowflake: interaction.guild.id });
        const current_value = report_setting[value as keyof ReportSetting] ?? false;

        await UpdateEntity(ReportSetting, { Snowflake: interaction.guild.id }, { [value]: !current_value });
    };

    const report_setting = await FindOrCreateEntity(ReportSetting, { Snowflake: interaction.guild.id });

    const embed_one = new EmbedBuilder()
    .setDescription(`## Overview\n- **Message Report** • ${report_setting.MessageReportStatus ? "<:Enabled:1250495120806121575>" : "<:Disabled:1250495173750816890>"}\n- **Notified Staff Team** • ${report_setting.MessageReportNotifiedStaffTeam ? "<:Enabled:1250495120806121575>" : "<:Disabled:1250495173750816890>"}\n- **Thread Mode** • ${report_setting.MessageReportThreadMode ? "<:Enabled:1250495120806121575>" : "<:Disabled:1250495173750816890>"}\n- **User Report** • ${report_setting.UserReportStatus ? "<:Enabled:1250495120806121575>" : "<:Disabled:1250495173750816890>"}\n- **Notified Staff Team** • ${report_setting.UserReportNotifiedStaffTeam ? "<:Enabled:1250495120806121575>" : "<:Disabled:1250495173750816890>"}\n- **Thread Mode** • ${report_setting.UserReportThreadMode ? "<:Enabled:1250495120806121575>" : "<:Disabled:1250495173750816890>"}`)
    .setColor(Blossom.DefaultHex());

    const action_row_one = new ButtonBuilder()
    .CreateRegularButton({
        custom_id: "ViewPluginReportSystemPage1",
        style: ButtonStyle.Primary,
        disabled: true,
        label: "Back"
    })
    .CreateRegularButton({
        custom_id: "undefined",
        style: ButtonStyle.Primary,
        disabled: true,
        label: "1/2"
    })
    .CreateRegularButton({
        custom_id: "ViewPluginReportSystemPage2",
        style: ButtonStyle.Primary,
        label: "Next"
    }).BuildActionRow();

    const action_row_two = new StringSelectMenuBuilder({
        custom_id: "EditReportSystemToggle",
        select_options: [
            {
                label: `Message Report • ${report_setting.MessageReportStatus ? "Disable?" : "Enable?"}`,
                value: "MessageReportStatus",
                description: "Allow members to create message reports"
            },
            {
                label: `Notified Staff Team • ${report_setting.MessageReportNotifiedStaffTeam ? "Disable?" : "Enable?"}`,
                value: "MessageReportNotifiedStaffTeam",
                description: "Pings the staff team roles when a message report is created"
            },
            {
                label: `Thread Mode • ${report_setting.MessageReportThreadMode ? "Disable?" : "Enable?"}`,
                value: "MessageReportThreadMode",
                description: "Creates the message report in a thread"
            },
            {
                label: `User Report • ${report_setting.UserReportStatus ? "Disable?" : "Enable?"}`,
                value: "UserReportStatus",
                description: "Allow members to create user reports"
            },
            {
                label: `Notified Staff Team • ${report_setting.UserReportNotifiedStaffTeam ? "Disable?" : "Enable?"}`,
                value: "UserReportNotifiedStaffTeam",
                description: "Pings the staff team roles when a user report is created"
            },
            {
                label: `Thread Mode • ${report_setting.UserReportThreadMode ? "Disable?" : "Enable?"}`,
                value: "UserReportThreadMode",
                description: "Creates the user report in a thread"
            }
        ],
        max_values: 6,
        placeholder: "Pick a setting to edit"
    }).BuildActionRow();

    const action_row_three = new ButtonBuilder()
    .CreateRegularButton({
        custom_id: "ExitPluginSetting",
        style: ButtonStyle.Secondary,
        label: "Exit"
    })
    .CreateRegularButton({
        custom_id: "ViewPluginHome",
        style: ButtonStyle.Secondary,
        label: "Home"
    })
    .CreateLinkButton({
        custom_id: "https://github.com/CosmosPortal/blossom#readme",
        style: ButtonStyle.Link,
        label: "Documentation"
    }).BuildActionRow();

    return void await interaction.editReply({ embeds: [embed_one], components: [action_row_one, action_row_two, action_row_three] });
};