import { CreateBlossomID } from "../Blossom";
import { Database } from "../../Classes";
import { DatabaseConnect, FindOrCreateEntity } from "../Database";
import { GuildSystem, InfractionSystem } from "../../Entities";
import type { InfractionCreation } from "../../Interfaces";

/**
 * Creates an infraction in a guild
 * @param {InfractionCreation} data - The structure of data needed to create the infraction
 * 
 * @example
 * ```ts
 * const infraction = await CreateInfraction({
 *     Snowflake: guild.id,
 *     CaseID: 1,
 *     CreationTimestamp: Date.now(),
 *     EvidenceAttachmentURL: "https://example.com",
 *     Reason: "Spamming the channels",
 *     RemovalReason: "",
 *     RemovalStaffID: "",
 *     StaffID: user.id,
 *     TargetID: target_user.id,
 *     Type: "WarnAdd"
 * });
 * ```
 */
export async function CreateInfraction(data: InfractionCreation): Promise<InfractionSystem> {
    if (!Database.isInitialized) await DatabaseConnect();

    const creation_timestamp = data.CreationTimestamp ?? Date.now();
    const guild_system = await FindOrCreateEntity(GuildSystem, { Snowflake: data.Snowflake });

    const infraction = new InfractionSystem();
    infraction.Active = data.Active ?? true;
    infraction.BlossomID = data.BlossomID ?? CreateBlossomID(creation_timestamp);
    infraction.CaseID = data.CaseID;
    infraction.CreationTimestamp = creation_timestamp;
    infraction.EvidenceAttachmentURL = data.EvidenceAttachmentURL;
    infraction.Guild_ID = data.Snowflake;
    infraction.Reason = data.Reason;
    infraction.RemovalReason = data.RemovalReason;
    infraction.RemovalStaffID = data.RemovalStaffID;
    infraction.StaffID = data.StaffID;
    infraction.TargetID = data.TargetID;
    infraction.Type = data.Type;
    infraction.Guild = guild_system;
    await Database.manager.save(infraction);

    return infraction;
};