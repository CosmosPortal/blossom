import { ButtonBuilder, CropText, IsValidURLFormat, StringSelectMenuBuilder } from "@cosmosportal/blossom.utils";
import { ButtonStyle, EmbedBuilder, type Client, type ModalSubmitInteraction } from "discord.js";
import { AppealSetting, Blossom, FindOrCreateEntity, Sentry, UpdateEntity } from "../../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: ModalSubmitInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isModalSubmit() || interaction.customId !== "EditAppealSystemAppealLink") return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.HasGuildSettingAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to members of the Management Team in ${interaction.guild.name}.`);
    if (!IsValidURLFormat(interaction.fields.getTextInputValue("appeal_link")) && interaction.fields.getTextInputValue("appeal_link") !== "{remove}") return void await Blossom.CreateInteractionError(interaction, "The appeal link you entered is not a valid URL format.");

    await interaction.deferUpdate();

    await UpdateEntity(AppealSetting, { Snowflake: interaction.guild.id }, { AppealLink: interaction.fields.getTextInputValue("appeal_link") === "{remove}" ? "" : interaction.fields.getTextInputValue("appeal_link") });

    const appeal_setting = await FindOrCreateEntity(AppealSetting, { Snowflake: interaction.guild.id });

    const embed_one = new EmbedBuilder()
    .setDescription(`## Overview\n- **Appeal Link** • ${!appeal_setting.AppealLink ? "No appeal link has been set." : CropText(appeal_setting.AppealLink, 47, true)}`)
    .setColor(Blossom.DefaultHex());

    const action_row_one = new ButtonBuilder()
    .CreateRegularButton({
        custom_id: "ViewPluginAppealSystemPage1",
        style: ButtonStyle.Primary,
        label: "Back"
    })
    .CreateRegularButton({
        custom_id: "undefined",
        style: ButtonStyle.Primary,
        disabled: true,
        label: "2/2"
    })
    .CreateRegularButton({
        custom_id: "ViewPluginAppealSystemPage2",
        style: ButtonStyle.Primary,
        disabled: true,
        label: "Next"
    }).BuildActionRow();

    const action_row_two = new StringSelectMenuBuilder({
        custom_id: "ViewPluginAppealSystem",
        select_options: [
            {
                label: "Edit Appeal Link",
                value: "AppealLink"
            }
        ],
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