import { ModalBuilder } from "@cosmosportal/blossom.utils";
import { TextInputStyle, type Client, type MessageComponentInteraction } from "discord.js";
import { AppealSetting, Blossom, FindOrCreateEntity, Sentry } from "../../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: MessageComponentInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isStringSelectMenu() || interaction.customId !== "ViewPluginAppealSystem") return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.HasGuildSettingAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to members of the Management Team in ${interaction.guild.name}.`);

    const appeal_setting = await FindOrCreateEntity(AppealSetting, { Snowflake: interaction.guild.id });

    if (interaction.values[0] === "AppealLink") {
        const modal_response = new ModalBuilder({
            custom_id: "EditAppealSystemAppealLink",
            title: "Appeal System | Editor"
        })
        .CreateTextInput({
            custom_id: "appeal_link",
            label: "Appeal Link",
            style: TextInputStyle.Short,
            max_length: 100,
            min_length: 8,
            placeholder: "Enter your link here or use {remove} to remove your link",
            required: true,
            value: !appeal_setting.AppealLink ? undefined : appeal_setting.AppealLink
        }).BuildResponse();

        return void await interaction.showModal(modal_response);
    };
};