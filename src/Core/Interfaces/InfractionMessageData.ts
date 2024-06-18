import type { Client, Guild } from "discord.js";
import type { InfractionSystem } from "../Entities";
import type { InfractionType, ModifiedInfractionType } from "../Types";

export interface InfractionMessageData {
    /**
     * Your client class to gather information
     */
    client: Client<true>;
    /**
     * Your guild class to gather information
     */
    guild: Guild;
    /**
     * The user's infraction
     */
    infraction: InfractionSystem;
    /**
     * The type of infraction
     */
    type: InfractionType;
    /**
     * The duration of the timeout
     */
    duration?: number | null;
    /**
     * The modified infraction structure
     */
    modified?: {
        /**
         * The reason for the modification or the old reason
         */
        reason: string | null;
        /**
         * The type of modification the client done
         */
        type: ModifiedInfractionType;
    };
};