import type { InfractionType, Snowflake } from "../Types";

export interface InfractionCreation {
    /**
     * The snowflake to create the infraction in
     */
    Snowflake: Snowflake;
    /**
     * The infraction aciton ID
     */
    ActionID: string;
    /**
     * Whether the infraction is active or not
     */
    Active: boolean;
    /**
     * The infraction case ID
     */
    CaseID: number;
    /**
     * The infraction creation timestamp
     */
    CreationTimestamp: string;
    /**
     * The infraction evidence attachment URL
     */
    EvidenceAttachmentURL: string;
    /**
     * The reason for the infraction creation
     */
    Reason: string;
    /**
     * The reason for the infraction removal
     */
    RemovalReason: string;
    /**
     * The staff ID that removed the infraction
     */
    RemovalStaffID: string;
    /**
     * The staff username that removed the infraction
     */
    RemovalStaffUsername: string;
    /**
     * The staff ID who created the infraction
     */
    StaffID: string;
    /**
     * The staff username who created the infraction
     */
    StaffUsername: string;
    /**
     * The user ID the infraction belongs to
     */
    TargetID: string;
    /**
     * The user username the infraction belongs to
     */
    TargetUsername: string;
    /**
     * The infraction type
     */
    Type: InfractionType;
};