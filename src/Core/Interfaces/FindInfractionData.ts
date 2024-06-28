import type { ActionID, InfractionType, Snowflake } from "../Types";

export interface FindInfractionData {
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
     * Whether to return one infraction besides all
     */
    return_one?: boolean;
    /**
     * The infraction type to look for
     */
    type?: InfractionType;
};