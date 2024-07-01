import { HasChannelPermissions, WebhookExist } from "@cosmosportal/blossom.utils";
import { PermissionsBitField } from "discord.js";
import { UpdateEntity } from "../Database";
import { LoggingSetting } from "../../Entities";
import type { ManageWebhooksData, ManageWebhooksOutput } from "../../Interfaces";

/**
 * Manages the client's webhooks for a guild
 * @param {ManageWebhooksData} data - The structure of data needed to manage the webhooks
 * 
 * @example
 * ```ts
 * const webhook_data = await ManageWebhooks({
 *     client: client,
 *     guild: guild,
 *     log_channel: channel,
 *     type: "ModerationPrivateLogWebhook",
 *     webhook_id: webhook.id,
 *     webhook_token: webhook.token
 * });
 * ```
 */
export async function ManageWebhooks(data: ManageWebhooksData): Promise<ManageWebhooksOutput> {
    let webhook_id: string;
    let webhook_token: string;

    if (!await WebhookExist(data.client, data.webhook_id, data.webhook_token)) {
        if (!await HasChannelPermissions(data.client, data.log_channel.id, data.client.user.id, [ PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageWebhooks ])) {
            webhook_id = data.webhook_id;
            webhook_token = data.webhook_token;
        }
        else {
            const webhook = await data.log_channel.createWebhook({
                name: data.client.user.username,
                avatar: data.client.user.displayAvatarURL({ forceStatic: false, size: 4096 }),
                reason: `Creating ${data.client.user.username} logging webhook`
            });

            webhook_id = webhook.id;
            webhook_token = webhook.token;

            await UpdateEntity(LoggingSetting, { Snowflake: data.guild.id }, { [data.type]: `${webhook_id}[Split]${webhook_token}` });
        };
    }
    else {
        webhook_id = data.webhook_id;
        webhook_token = data.webhook_token;
    };

    return { webhook_id, webhook_token };
};