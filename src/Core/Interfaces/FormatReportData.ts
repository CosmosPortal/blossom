import type { ActionID, ReportType, Snowflake } from "../Types";

export interface FormatReportData {
    /**
     * The action ID to look for
     */
    action_id?: ActionID;
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