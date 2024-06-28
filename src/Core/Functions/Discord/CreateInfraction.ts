import { Database } from "../../Classes";
import { DatabaseConnect, FindOrCreateEntity } from "../Database";
import { GuildSystem, InfractionSystem } from "../../Entities";
import type { InfractionCreation } from "../../Interfaces";

/**
 * Creates an infraction
 * @param {InfractionCreation} data - The structure of data needed to create the infraction
 * 
 * @example
 * ```ts
 * const infraction = await CreateInfraction({
 *     Snowflake: interaction.guild.id,
 *     ActionID: "2024-06-24-1000",
 *     Active: true,
 *     CaseID: 1,
 *     CreationTimestamp: `${Date.now}`,
 *     EvidenceAttachmentURL: "https://example.com",
 *     Reason: "Spamming the channels",
 *     RemovalReason: "",
 *     RemovalStaffID: "",
 *     RemovalStaffUsername: "",
 *     StaffID: interaction.user.id,
 *     StaffUsername: interaction.user.tag,
 *     TargetID: target_user.id,
 *     TargetUsername: target_user.tag,
 *     Type: "WarnAdd"
 * });
 * ```
 */
export async function CreateInfraction(data: InfractionCreation): Promise<InfractionSystem> {
    if (!Database.isInitialized) await DatabaseConnect();

    const guild_system = await FindOrCreateEntity(GuildSystem, { Snowflake: data.Snowflake });
    const infraction = new InfractionSystem();
    infraction.ActionID = data.ActionID;
    infraction.Active = data.Active;
    infraction.CaseID = data.CaseID;
    infraction.CreationTimestamp = data.CreationTimestamp;
    infraction.EvidenceAttachmentURL = data.EvidenceAttachmentURL;
    infraction.Guild_ID = data.Snowflake;
    infraction.Reason = data.Reason;
    infraction.RemovalReason = data.RemovalReason;
    infraction.RemovalStaffID = data.RemovalStaffID;
    infraction.RemovalStaffUsername = data.RemovalStaffUsername;
    infraction.StaffID = data.StaffID;
    infraction.StaffUsername = data.StaffUsername;
    infraction.TargetID = data.TargetID;
    infraction.TargetUsername = data.TargetUsername;
    infraction.Type = data.Type;
    infraction.Guild = guild_system;
    await Database.manager.save(infraction);

    return infraction;
};