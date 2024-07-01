import type { BlossomID, InfractionType, Snowflake } from "../Types";

export interface FormatInfractionData {
    /**
     * The Blossom ID to look for
     */
    blossom_id?: BlossomID;
    /**
     * The member the infraction belongs to
     */
    from_member?: Snowflake;
    /**
     * Whether to show inactive infractions
     */
    is_inactive?: boolean;
    /**
     * The infraction type to look for
     */
    type?: InfractionType;
};