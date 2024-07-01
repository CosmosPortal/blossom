import type { BlossomID, ReportType, Snowflake } from "../Types";

export interface FindReportData {
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
     * Whether to return one report besides all
     */
    return_one?: boolean;
    /**
     * The report type to look for
     */
    type?: ReportType;
};