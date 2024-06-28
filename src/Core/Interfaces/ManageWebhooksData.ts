import type { Client, Guild, NewsChannel, TextChannel } from "discord.js";
import type { WebhookType } from "../Types";

export interface ManageWebhooksData {
    /**
     * Your client class to gather information
     */
    client: Client<true>;
    /**
     * Your guild class to gather information
     */
    guild: Guild;
    /**
     * The type of webhook to manage
     */
    type: WebhookType;
    /**
     * The channel the webhook belongs to
     */
    log_channel: TextChannel | NewsChannel;
    /**
     * The webhook ID
     */
    webhook_id: string;
    /**
     * The webhook token
     */
    webhook_token: string;
};