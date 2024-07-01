import type { BlossomID, Snowflake } from "../Types";

export interface FormatTagData {
    /**
     * The Blossom ID to look for
     */
    blossom_id?: BlossomID;
    /**
     * The member who created the tag
     */
    from_member?: Snowflake;
    /**
     * Whether to show tags only staff members can use
     */
    staff_only?: boolean;
};