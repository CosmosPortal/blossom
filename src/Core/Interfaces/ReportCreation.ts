import type { ActionID, ReportType, Snowflake } from "../Types";

export interface ReportCreation {
    /**
     * The snowflake to create the report in
     */
    Snowflake: Snowflake;
    /**
     * The report aciton ID
     */
    ActionID: ActionID;
    /**
     * Whether the report is active or not
     */
    Active: boolean;
    /**
     * The report case ID
     */
    CaseID: number;
    /**
     * The report creation timestamp
     */
    CreationTimestamp: string;
    /**
     * The report evidence attachment URL
     */
    EvidenceAttachmentURL: string;
    /**
     * The channel ID the report was made
     */
    FlaggedChannelID: Snowflake;
    /**
     * The message ID that was reported
     */
    FlaggedMessageID: Snowflake;
    /**
     * If the member been banned
     */
    HasBanAddLogged: boolean;
    /**
     * If the member been kicked
     */
    HasKickLogged: boolean;
    /**
     * If the member been timed out
     */
    HasTimeoutAddLogged: boolean;
    /**
     * If the member been given a warning
     */
    HasWarnAddLogged: boolean;
    /**
     * If the member been given a verbal warning
     */
    HasWarnVerbalLogged: boolean;
    /**
     * If the reported message has been deleted
     */
    IsMessageDeleted: boolean;
    /**
     * The reason for the report creation
     */
    Reason: string;
    /**
     * The report channel ID
     */
    ReportChannelID: Snowflake;
    /**
     * The reporter's ID
     */
    ReporterID: Snowflake;
    /**
     * The reporter's username
     */
    ReporterUsername: string;
    /**
     * The report message ID
     */
    ReportMessageID: Snowflake;
    /**
     * The user's ID that is being reported
     */
    TargetID: Snowflake;
    /**
     * The user's username that is being reported
     */
    TargetUsername: string;
    /**
     * The report type
     */
    Type: ReportType;
};