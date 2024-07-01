import type { BlossomID, ReportType, Snowflake } from "../Types";

export interface ReportCreation {
    /**
     * The snowflake to create the report in
     */
    Snowflake: Snowflake;
    /**
     * The report's case ID
     */
    CaseID: number;
    /**
     * The report's evidence attachment URL
     */
    EvidenceAttachmentURL: string;
    /**
     * The channel ID the report was made
     * 
     * @note Only for "MessageReport" type.
     */
    FlaggedChannelID: Snowflake;
    /**
     * The message ID that was reported
     * 
     * @note Only for "MessageReport" type.
     */
    FlaggedMessageID: Snowflake;
    /**
     * The reason for the report creation
     */
    Reason: string;
    /**
     * The channel ID the report was sent to
     */
    ReportChannelID: Snowflake;
    /**
     * The reporter's ID
     */
    ReporterID: Snowflake;
    /**
     * The message ID of the report sent
     */
    ReportMessageID: Snowflake;
    /**
     * The user's ID that is being reported
     */
    TargetID: Snowflake;
    /**
     * The report type to create
     */
    Type: ReportType;
    /**
     * Whether the report is active or not
     */
    Active?: boolean;
    /**
     * The report's Blossom ID
     */
    BlossomID?: BlossomID;
    /**
     * The report's creation timestamp
     */
    CreationTimestamp?: number;
    /**
     * If the ban add action been used
     */
    HasBanAddLogged?: boolean;
    /**
     * If the kick action been used
     */
    HasKickLogged?: boolean;
    /**
     * If the timeout add action been used
     */
    HasTimeoutAddLogged?: boolean;
    /**
     * If the warn add action been used
     */
    HasWarnAddLogged?: boolean;
    /**
     * If the warn verbal action been used
     */
    HasWarnVerbalLogged?: boolean;
    /**
     * If the delete message action been used
     * 
     * @note Only for "MessageReport" type.
     */
    IsMessageDeleted?: boolean;
};