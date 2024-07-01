import type { BlossomID, ReportType, Snowflake } from "../Types";

export interface FormatReportData {
    /**
     * The Blossom ID to look for
     */
    blossom_id?: BlossomID;
    /**
     * The member who created the report
     */
    from_member?: Snowflake;
    /**
     * Whether to show inactive reports
     */
    is_inactive?: boolean;
    /**
     * The report type to look for
     */
    type?: ReportType;
};