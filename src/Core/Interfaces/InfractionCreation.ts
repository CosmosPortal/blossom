import type { BlossomID, InfractionType, Snowflake } from "../Types";

export interface InfractionCreation {
    /**
     * The snowflake to create the infraction in
     */
    Snowflake: Snowflake;
    /**
     * The infraction's case ID
     */
    CaseID: number;
    /**
     * The infraction's evidence attachment URL
     */
    EvidenceAttachmentURL: string;
    /**
     * The reason for the infraction creation
     */
    Reason: string;
    /**
     * The reason for the infraction being marked as inactive
     */
    RemovalReason: string;
    /**
     * The staff ID that marked the infraction inactive
     */
    RemovalStaffID: Snowflake;
    /**
     * The staff ID who created the infraction
     */
    StaffID: Snowflake;
    /**
     * The user ID the infraction belongs to
     */
    TargetID: Snowflake;
    /**
     * The infraction type to create
     */
    Type: InfractionType;
    /**
     * Whether the infraction is active or not
     */
    Active?: boolean;
    /**
     * The infraction's Blossom ID
     */
    BlossomID?: BlossomID;
    /**
     * The infraction's creation timestamp
     */
    CreationTimestamp?: number;
};