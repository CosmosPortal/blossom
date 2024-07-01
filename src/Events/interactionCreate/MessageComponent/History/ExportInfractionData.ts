import { AttachmentBuilder, type Client, type MessageComponentInteraction } from "discord.js";
import { ActionName, Blossom, FindInfraction, FindOrCreateEntity, MemberID, Sentry, type InfractionSystem, type InfractionType } from "../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: MessageComponentInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isButton() || !interaction.customId.startsWith("ExportInfractionData")) return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.HasModerationAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to members of the Moderation Team in ${interaction.guild.name}.`);

    await interaction.deferReply({ ephemeral: true });

    const custom_id = interaction.customId.split("_");
    const type = custom_id[1] as InfractionType;
    const user = await client.users.fetch(custom_id[2]).catch(() => { return undefined });

    if (!user) return void await Blossom.CreateInteractionError(interaction, `An issue occured with fetching the user. The user either no longer exist or ${client.user.username} couldn't fetch the user.`);
    if (interaction.user.id !== user.id && !await Sentry.HasModerationAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to members of the Moderation Team in ${interaction.guild.name}.`);

    const member_id = await FindOrCreateEntity(MemberID, { Snowflake: `${user.id}_${interaction.guild.id}` });
    const infractions = await FindInfraction(interaction.guild.id, {
        from_member: user.id,
        is_inactive: true,
        type: type
    }) as InfractionSystem[] | null;
    if (!infractions) return void await Blossom.CreateInteractionError(interaction, `The user doesn't have any ${ActionName[type].toLowerCase()} infraction IDs that exist.`);

    const data = infractions.map((infraction) => {
        return {
            infractionsID: infraction.BlossomID,
            active: infraction.Active,
            caseID: String(infraction.CaseID),
            creationTimestamp: infraction.CreationTimestamp,
            evidenceAttachmentURL: infraction.EvidenceAttachmentURL ? infraction.EvidenceAttachmentURL : null,
            reason: infraction.Reason,
            removalReason: infraction.RemovalReason ? infraction.RemovalReason : null,
            removalStaffID: "anonymous",
            staffID: "anonymous",
            targetID: infraction.TargetID,
            type: infraction.Type
        }
    });

    const format = {
        username: user.tag,
        user_id: user.id,
        guild_name: interaction.guild.name,
        guild_id: interaction.guild.id,
        total_infractions: String(member_id.WarnInfraction),
        infraction_data: data
    };

    const file_one = new AttachmentBuilder(Buffer.from(JSON.stringify(format, null, 2)), { name: `${user.id}_${interaction.guild.id}.json` });

    return void await interaction.followUp({ content: `Exported infraction data belonging to <@${user.id}>. Staff data are marked as "anonymous" for privacy.`, files: [file_one], ephemeral: true });
};