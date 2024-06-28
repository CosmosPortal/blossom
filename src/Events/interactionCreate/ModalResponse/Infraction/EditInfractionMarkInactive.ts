import { Blossom, FindOneEntity, InfractionMessage, InfractionSystem, InfractionType, Sentry, UpdateEntity, UpdateMemberID } from "../../../../Core";
import type { CommandKit } from "commandkit";
import type { Client, ModalSubmitInteraction } from "discord.js";

export default async function (interaction: ModalSubmitInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isModalSubmit() || !interaction.customId.startsWith("EditInfractionMarkInactive")) return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.HasManagementAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to members of the Management Team in ${interaction.guild.name}.`);

    await interaction.deferReply({ ephemeral: true });

    const custom_id = interaction.customId.split("_")[1];
    const infraction = await FindOneEntity(InfractionSystem, { ActionID: custom_id, Guild_ID: interaction.guild.id });
    if (!infraction) return void await Blossom.CreateInteractionError(interaction, `The action ID you entered doesn't exist in ${interaction.guild.name}.`);
    if (!infraction.Active) return void await Blossom.CreateInteractionError(interaction, "You cannot mark the aciton ID as inactive due to it being inactive already.");
    if (infraction.Type === "WarnAdd") await UpdateMemberID(`${interaction.user.id}_${interaction.guild.id}`, "WarnInfraction", true);
    await UpdateEntity(InfractionSystem, { ActionID: custom_id, Guild_ID: interaction.guild.id }, {
        Active: false,
        RemovalReason: interaction.fields.getTextInputValue("reason"),
        RemovalStaffID: interaction.user.id,
        RemovalStaffUsername: interaction.user.tag
    });
    const refresh_infraction = await FindOneEntity(InfractionSystem, { ActionID: custom_id, Guild_ID: interaction.guild.id }) as InfractionSystem;

    const infraction_message = new InfractionMessage({
        client: client,
        guild: interaction.guild,
        infraction: refresh_infraction,
        type: refresh_infraction.Type as InfractionType,
        modified: {
            reason: interaction.fields.getTextInputValue("reason"),
            type: "MarkInactive"
        }
    });

    await infraction_message.SendModifiedWebhook("Private");
    await infraction_message.SendModifiedWebhook("Public");

    return void await interaction.followUp({ content: `Action ID [\`${custom_id}\`] has been marked as inactive in **${interaction.guild.name}**!`, ephemeral: true });
};