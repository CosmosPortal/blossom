import { Blossom, FindOneEntity, InfractionMessage, InfractionSystem, InfractionType, Sentry, UpdateEntity } from "../../../../Core";
import type { CommandKit } from "commandkit";
import type { Client, ModalSubmitInteraction } from "discord.js";

export default async function (interaction: ModalSubmitInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isModalSubmit() || !interaction.customId.startsWith("EditInfractionReason")) return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.BlossomGuildManagementAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to members of the Management Team in ${interaction.guild.name}.`);

    await interaction.deferReply({ ephemeral: true });

    const custom_id = interaction.customId.split("_")[1];
    const infraction = await FindOneEntity(InfractionSystem, { ActionID: custom_id, InfractionGuildID: interaction.guild.id });
    if (!infraction) return void await Blossom.CreateInteractionError(interaction, `The action ID you entered doesn't exist in ${interaction.guild.name}.`);
    if (!infraction.Active) return void await Blossom.CreateInteractionError(interaction, "You cannot edit a reason for an action ID that is marked as inactive.");
    await UpdateEntity(InfractionSystem, { ActionID: custom_id, InfractionGuildID: interaction.guild.id }, { Reason: interaction.fields.getTextInputValue("reason") });
    const refresh_infraction = await FindOneEntity(InfractionSystem, { ActionID: custom_id, InfractionGuildID: interaction.guild.id }) as InfractionSystem;

    const infraction_message = new InfractionMessage({
        client: client,
        guild: interaction.guild,
        infraction: refresh_infraction,
        type: refresh_infraction.Type as InfractionType,
        modified: {
            reason: infraction.Reason,
            type: "Reason"
        }
    });

    await infraction_message.SendModifiedWebhook("Private");
    await infraction_message.SendModifiedWebhook("Public");

    return void await interaction.followUp({ content: `Action ID [\`${custom_id}\`] reason has been edited in **${interaction.guild.name}**!`, ephemeral: true });
};