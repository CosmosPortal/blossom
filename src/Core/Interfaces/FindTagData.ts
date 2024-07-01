import type { BlossomID, Snowflake } from "../Types";

export interface FindTagData {
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
    /**
     * Whether to return one tag besides all
     */
    return_one?: boolean;
};