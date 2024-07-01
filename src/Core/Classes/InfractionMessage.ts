import { ButtonBuilder, FormatTime, GuildChannelExist, HasChannelPermissions, WebhookExist } from "@cosmosportal/blossom.utils";
import { ButtonStyle, EmbedBuilder, PermissionsBitField, WebhookClient, type APIMessage, type Channel, type Message, type NewsChannel, type TextChannel } from "discord.js";
import { AppealSetting, LoggingSetting } from "../Entities";
import { ActionName, Color } from "../Enums";
import { FindOrCreateEntity, ManageWebhooks } from "../Functions";
import type { InfractionMessageData } from "../Interfaces";
import type { InfractionType } from "../Types";

export class InfractionMessage {
    private readonly _data: InfractionMessageData;

    /**
     * @example
     * ```ts
     * const infraction_message = new InfractionMessage({
     *     client: client,
     *     guild: guild,
     *     infraction: infraction_system,
     *     type: "BanAdd"
     * });
     * ```
     */
    public constructor(data: InfractionMessageData) {
        this._data = { ...data };
    };

    /**
     * Sends a confirmation message with a few information about the action
     * @param {Channel | null} channel - The channel to send the confirmation message
     * 
     * @example
     * ```ts
     * await infraction_message.ConfirmationMessage(channel);
     * ```
     */
    public async ConfirmationMessage(channel: Channel | null): Promise<Message<true> | undefined> {
        if (!channel) return;
        if (!channel.isTextBased() || channel.isDMBased()) return;
        if (!await HasChannelPermissions(this._data.client, channel.id, this._data.client.user.id, [ PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks ])) return;

        const user = await this._data.client.users.fetch(this._data.infraction.TargetID).catch(() => { return undefined });
        if (!user) return;

        const description = {
            BanAdd: `**${user.tag}** has been banned in **${this._data.guild.name}**!`,
            BanRemove: `**${user.tag}**'s ban has been removed in **${this._data.guild.name}**!`,
            BanSoft: `**${user.tag}** has been soft banned in **${this._data.guild.name}**!`,
            Kick: `**${user.tag}** has been kicked from **${this._data.guild.name}**!`,
            TimeoutAdd: `**${user.tag}** has been timed out in **${this._data.guild.name}** for ${FormatTime(this._data.duration ?? 0, ", ")}!`,
            TimeoutRemove: `**${user.tag}**'s timeout has been removed in **${this._data.guild.name}**!`,
            WarnAdd: `**${user.tag}** has been warned in **${this._data.guild.name}**!`,
            WarnRemove: `**${user.tag}**'s warning has been removed in **${this._data.guild.name}**!`,
            WarnVerbal: `**${user.tag}** has been verbal warned in **${this._data.guild.name}**!`
        };

        const embed_one = new EmbedBuilder()
        .setThumbnail(user.displayAvatarURL({ forceStatic: false, size: 4096 }))
        .setAuthor({ name: `Case #${this._data.infraction.CaseID} | ${ActionName[this._data.type]}` })
        .setDescription(description[this._data.type])
        .setFields(
            { name: "Moderation Information", value: `- **Infraction ID** • ${this._data.infraction.BlossomID}${this._data.duration ? `\n- **Duration** • ${FormatTime(this._data.duration, ", ")}` : ""}` },
            { name: "Reason", value: this._data.infraction.RemovalReason ? this._data.infraction.RemovalReason : this._data.infraction.Reason }
        )
        .setColor(Color[this._data.type]);

        const action_row_one = new ButtonBuilder()
        .CreateRegularButton({
            custom_id: "ExitModerationConfirmation",
            style: ButtonStyle.Danger,
            label: "X"
        }).BuildActionRow();

        return await channel.send({ content: `<@${user.id}>`, embeds: [embed_one], components: [action_row_one], allowedMentions: { parse: [ "users" ] } });
    };

    /**
     * Sends a moderation log message to the target user
     * 
     * @example
     * ```ts
     * await infraction_message.SendDM();
     * ```
     */
    public async SendDM(): Promise<Message<false> | undefined> {
        const user = await this._data.client.users.fetch(this._data.infraction.TargetID).catch(() => { return undefined });
        if (!user) return;

        const dm_enabled = await user.send(" ").catch((error) => error.code);
        if (dm_enabled === 50007) return;

        const content = {
            BanAdd: `You have been banned in **${this._data.guild.name}**!`,
            BanRemove: `Your ban in **${this._data.guild.name}** has been removed!`,
            BanSoft: `You have been soft banned in **${this._data.guild.name}**!`,
            Kick: `You have been kicked from **${this._data.guild.name}**!`,
            TimeoutAdd: `You have been timed out in **${this._data.guild.name}** for ${FormatTime(this._data.duration ?? 0, ", ")}!`,
            TimeoutRemove: `Your timeout in **${this._data.guild.name}** was removed!`,
            WarnAdd: `You have been warned in **${this._data.guild.name}**!`,
            WarnRemove: `Your warning has been removed in **${this._data.guild.name}**!`,
            WarnVerbal: `You have been verbal warned in **${this._data.guild.name}**!`
        };

        const embed_one = new EmbedBuilder()
        .setThumbnail(user.displayAvatarURL({ forceStatic: false, size: 4096 }))
        .setAuthor({ name: `Case #${this._data.infraction.CaseID} | ${ActionName[this._data.type]}` })
        .addFields(
            { name: "Moderation Information", value: `- **Infraction ID** • ${this._data.infraction.BlossomID}\n- **Creation** • <t:${Math.trunc(Math.floor(this._data.infraction.CreationTimestamp / 1000))}:D>\n${this._data.duration ? `- **Duration** • ${FormatTime(this._data.duration, ", ")}\n` : ""}- **Status** • ${this._data.infraction.Active == true ? "Active" : "Inactive"}` },
            { name: "Reason", value: this._data.type === "WarnRemove" && this._data.infraction.RemovalReason ? this._data.infraction.RemovalReason : this._data.infraction.Reason }
        )
        .setColor(Color[this._data.type])

        const appeal_setting = await FindOrCreateEntity(AppealSetting, { Snowflake: this._data.guild.id });
        const action_row_one = [];

        if (appeal_setting.AppealLink && appeal_setting.AppealLinkStatus && (this._data.type === "BanAdd" || this._data.type === "TimeoutAdd" || this._data.type === "WarnAdd")) {
            action_row_one.push(new ButtonBuilder()
            .CreateLinkButton({
                custom_id: appeal_setting.AppealLink,
                style: ButtonStyle.Link,
                label: "Appeal"
            }).BuildActionRow());
        };

        return await user.send({ content: content[this._data.type], embeds: [embed_one], components: action_row_one });
    };

    /**
     * Sends a modified moderation log message to the private or public log moderation channel
     * @param {"Private" | "Public"} type - Whether to send a private or public log
     * 
     * @note Requires "modified" data strucutre to use
     * 
     * @example
     * ```ts
     * await infraction_message.SendModifiedWebhook("Private");
     * ```
     */
    public async SendModifiedWebhook(type: "Private" | "Public"): Promise<APIMessage | undefined> {
        if (!this._data.modified) return;
        const user = await this._data.client.users.fetch(this._data.infraction.TargetID).catch(() => { return undefined });
        if (!user) return;

        const logging_setting = await FindOrCreateEntity(LoggingSetting, { Snowflake: this._data.guild.id });
        const log_status = logging_setting[`Moderation${type}LogStatus`];
        const logging_channel = logging_setting[`Moderation${type}LogChannel`];
        const log_channel = await this._data.guild.channels.fetch(logging_channel).catch(() => { return undefined }) as TextChannel | NewsChannel | undefined;
        const logging_webhook = logging_setting[`Moderation${type}LogWebhook`];

        if (!log_status || !await GuildChannelExist(this._data.guild, logging_channel) || !log_channel) return;

        const webhook_data = logging_webhook.split("[Split]");
        const old_webhook = await this._data.client.fetchWebhook(webhook_data[0], webhook_data[1]).catch(() => { return undefined });

        if (old_webhook && log_channel.id === old_webhook.channelId) {
            if (await HasChannelPermissions(this._data.client, old_webhook.channelId, this._data.client.user.id, [ PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageWebhooks ])) old_webhook.delete(`Deleting ${this._data.client.user.username} old moderation log webhook`);
        };

        const staff = await this._data.client.users.fetch(this._data.infraction.StaffID).catch(() => { return undefined });
        const removal_staff = await this._data.client.users.fetch(this._data.infraction.RemovalStaffID).catch(() => { return undefined });

        const log_webhook = await ManageWebhooks({
            client: this._data.client,
            guild: this._data.guild,
            log_channel: log_channel,
            type: `Moderation${type}LogWebhook`,
            webhook_id: webhook_data[0],
            webhook_token: webhook_data[1]
        });

        const fields = [
            { name: "Moderation Information", value: `- **Infraction ID** • ${this._data.infraction.BlossomID}\n- **Creation** • <t:${Math.trunc(Math.floor(this._data.infraction.CreationTimestamp / 1000))}:D>\n- **Status** • ${this._data.infraction.Active == true ? "Active" : "Inactive"}\n- **Staff Member** • ${staff?.tag ?? "unknown"} [\`${this._data.infraction.StaffID}\`]\n- **Target Member** • ${user.tag} [\`${this._data.infraction.TargetID}\`]` }
        ];

        if (this._data.modified.type === "MarkActive" && this._data.modified.reason) fields.push(
            { name: "Reason", value: this._data.infraction.Reason },
            { name: "Active Reason", value: this._data.modified.reason }
        );

        if (this._data.modified.type === "MarkInactive") fields.push(
            { name: "Reason", value: this._data.infraction.Reason },
            { name: "Removal Information", value: `- **Staff Member** • ${removal_staff?.tag ?? "unknown"} [\`${this._data.infraction.RemovalStaffID}\`]` },
            { name: "Removal Reason", value: this._data.infraction.RemovalReason }
        );

        if (this._data.modified.type === "Reason" && this._data.modified.reason) fields.push(
            { name: "Old Reason", value: this._data.modified.reason },
            { name: "New Reason", value: this._data.infraction.Reason }
        );

        if (this._data.modified.type === "RemovalReason" && this._data.modified.reason) fields.push(
            { name: "Old Reason", value: this._data.modified.reason },
            { name: "New Reason", value: this._data.infraction.RemovalReason }
        );

        const embed_one = new EmbedBuilder()
        .setThumbnail(user.displayAvatarURL({ forceStatic: false, size: 4096 }))
        .setAuthor({ name: `Case #${this._data.infraction.CaseID} | ${ActionName[this._data.type]}` })
        .setFields(fields)
        .setColor(Color[this._data.infraction.Type as InfractionType]);

        if (!await WebhookExist(this._data.client, log_webhook.webhook_id, log_webhook.webhook_token)) return;

        const webhook = new WebhookClient({ id: log_webhook.webhook_id, token: log_webhook.webhook_token });
        return await webhook.send({ embeds: [embed_one] });
    };

    /**
     * Sends a moderation log message to the private or public moderation log channel
     * @param {"Private" | "Public"} type - Whether to send a private or public log
     * 
     * @example
     * ```ts
     * await infraction_message.SendWebhook("Private");
     * ```
     */
    public async SendWebhook(type: "Private" | "Public"): Promise<APIMessage | undefined> {
        const user = await this._data.client.users.fetch(this._data.infraction.TargetID).catch(() => { return undefined });
        if (!user) return;

        const logging_setting = await FindOrCreateEntity(LoggingSetting, { Snowflake: this._data.guild.id });
        const log_status = logging_setting[`Moderation${type}LogStatus`];
        const logging_channel = logging_setting[`Moderation${type}LogChannel`];
        const log_channel = await this._data.guild.channels.fetch(logging_channel).catch(() => { return undefined }) as TextChannel | NewsChannel | undefined;
        const logging_webhook = logging_setting[`Moderation${type}LogWebhook`];

        if (!log_status || !await GuildChannelExist(this._data.guild, logging_channel) || !log_channel) return;

        const webhook_data = logging_webhook.split("[BlossomSplit]");
        const old_webhook = await this._data.client.fetchWebhook(webhook_data[0], webhook_data[1]).catch(() => { return undefined });

        if (old_webhook && log_channel.id === old_webhook.channelId) {
            if (await HasChannelPermissions(this._data.client, old_webhook.channelId, this._data.client.user.id, [ PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageWebhooks ])) old_webhook.delete(`Deleting ${this._data.client.user.username} old moderation log webhook`);
        };

        const staff = await this._data.client.users.fetch(this._data.infraction.StaffID).catch(() => { return undefined });

        const log_webhook = await ManageWebhooks({
            client: this._data.client,
            guild: this._data.guild,
            log_channel: log_channel,
            type: `Moderation${type}LogWebhook`,
            webhook_id: webhook_data[0],
            webhook_token: webhook_data[1]
        });

        const embed_one = new EmbedBuilder()
        .setThumbnail(user.displayAvatarURL({ forceStatic: false, size: 4096 }))
        .setAuthor({ name: `Case #${this._data.infraction.CaseID} | ${ActionName[this._data.type]}` })
        .addFields(
            { name: "Moderation Information", value: `- **Infraction ID** • ${this._data.infraction.BlossomID}\n- **Creation** • <t:${Math.trunc(Math.floor(this._data.infraction.CreationTimestamp / 1000))}:D>\n${this._data.duration ? `- **Duration** • ${FormatTime(this._data.duration, ", ")}\n` : ""}- **Status** • ${this._data.infraction.Active == true ? "Active" : "Inactive"}\n- **Staff Member** • ${staff?.tag ?? "unknown"} [\`${this._data.infraction.StaffID}\`]\n- **Target Member** • ${user.tag} [\`${this._data.infraction.TargetID}\`]` },
            { name: "Reason", value: this._data.type === "WarnRemove" && this._data.infraction.RemovalReason ? this._data.infraction.RemovalReason : this._data.infraction.Reason }
        )
        .setColor(Color[this._data.type]);

        if (!await WebhookExist(this._data.client, log_webhook.webhook_id, log_webhook.webhook_token)) return;

        const webhook = new WebhookClient({ id: log_webhook.webhook_id, token: log_webhook.webhook_token });
        return await webhook.send({ embeds: [embed_one] });
    };
};