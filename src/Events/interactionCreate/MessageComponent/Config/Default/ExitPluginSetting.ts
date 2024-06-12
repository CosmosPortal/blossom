import { setTimeout } from "timers/promises";
import { Blossom, Sentry } from "../../../../../Core";
import type { CommandKit } from "commandkit";
import type { Client, MessageComponentInteraction } from "discord.js";

export default async function (interaction: MessageComponentInteraction, client: Client<true>, handler: CommandKit) {
    if (!interaction.inCachedGuild() || !interaction.isButton() || interaction.customId !== "ExitPluginSetting") return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return;
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);

    await interaction.deferUpdate();
    await setTimeout(500);
    return void await interaction.deleteReply();
};