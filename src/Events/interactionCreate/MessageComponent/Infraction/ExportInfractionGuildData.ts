import { AttachmentBuilder, type Client, type MessageComponentInteraction } from "discord.js";
import { ActionTypeName, Blossom, FindInfraction, FindOrCreateEntity, GuildID, Sentry, type InfractionSystem, type InfractionType } from "../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: MessageComponentInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isButton() || !interaction.customId.startsWith("ExportInfractionGuildData")) return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.HasManagementAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to members of the Management Team in ${interaction.guild.name}.`);

    await interaction.deferReply({ ephemeral: true });

    const custom_id = interaction.customId.split("_");
    const type = custom_id[1] as InfractionType;

    const guild_id = await FindOrCreateEntity(GuildID, { Snowflake: interaction.guild.id });
    const infractions = await FindInfraction(interaction.guild.id, {
        is_inactive: true,
        type: type
    }) as InfractionSystem[] | null;
    if (!infractions) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} doesn't have any ${ActionTypeName[type].toLowerCase()} action IDs that exist.`);

    const data = infractions.map((infraction) => {
        return {
            actionID: infraction.ActionID,
            active: infraction.Active,
            caseID: String(infraction.CaseID),
            creationTimestamp: infraction.CreationTimestamp,
            evidenceAttachmentURL: infraction.EvidenceAttachmentURL ? infraction.EvidenceAttachmentURL : null,
            reason: infraction.Reason,
            removalReason: infraction.RemovalReason ? infraction.RemovalReason : null,
            removalStaffID: "anonymous",
            removalStaffUsername: "anonymous",
            staffID: "anonymous",
            staffUsername: "anonymous",
            targetID: infraction.TargetID,
            targetUsername: infraction.TargetUsername,
            type: infraction.Type
        }
    });

    const format = {
        guild_name: interaction.guild.name,
        guild_id: interaction.guild.id,
        total_infractions: String(guild_id.InfractionCreation),
        infraction_data: data
    };

    const file_one = new AttachmentBuilder(Buffer.from(JSON.stringify(format, null, 2)), { name: `${interaction.guild.id}.json` });

    return void await interaction.followUp({ content: `Exported infraction data belonging to ${interaction.guild.name}. Staff data are marked as "anonymous" for privacy.`, files: [file_one], ephemeral: true });
};