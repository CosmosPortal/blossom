import type { ActionID, InfractionType, Snowflake } from "../Types";

export interface FormatInfractionData {
    /**
     * The action ID to look for
     */
    action_id?: ActionID;
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