import { ButtonBuilder, GuildChannelExist, HasChannelPermissions, WebhookExist } from "@cosmosportal/blossom.utils";
import { ButtonStyle, EmbedBuilder, PermissionsBitField, WebhookClient, type Channel, type NewsChannel, type TextChannel } from "discord.js";
import { GuildModerationSetting } from "../Entities";
import { ActionType, Color } from "../Enums";
import { FindOrCreateEntity, FormatTimeout, UpdateEntity } from "../Functions";
import type { InfractionMessageData } from "../Interfaces";
import type { InfractionType } from "../Types";

export class InfractionMessage {
    private readonly _data: InfractionMessageData;

    /**
     * @example
     * ```ts
     * const infraction_message = new InfractionMessage({
     *     client: client,
     *     guild: interaction.guild,
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
     * await infraction_message.ConfirmationMessage(interaction.channel);
     * ```
     */
    public async ConfirmationMessage(channel: Channel | null): Promise<void> {
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
            TimeoutAdd: `**${user.tag}** has been timed out in **${this._data.guild.name}** for ${FormatTimeout(this._data.duration ?? 0)}!`,
            TimeoutRemove: `**${user.tag}**'s timeout has been removed in **${this._data.guild.name}**!`,
            WarnAdd: `**${user.tag}** has been warned in **${this._data.guild.name}**!`,
            WarnRemove: `**${user.tag}**'s warning has been removed in **${this._data.guild.name}**!`
        };

        const embed_one = new EmbedBuilder()
        .setThumbnail(user.displayAvatarURL({ forceStatic: false, size: 4096 }))
        .setAuthor({ name: `Case #${this._data.infraction.CaseID} | ${ActionType[this._data.type]}` })
        .setDescription(description[this._data.type])
        .setFields(
            { name: "Moderation Information", value: `- **Action ID** • ${this._data.infraction.ActionID}${this._data.duration ? `\n- **Duration** • ${FormatTimeout(this._data.duration)}` : ""}` },
            { name: "Reason", value: this._data.infraction.RemovalReason ? this._data.infraction.RemovalReason : this._data.infraction.Reason }
        )
        .setColor(Color[this._data.type]);

        const action_row_one = new ButtonBuilder()
        .CreateRegularButton({
            custom_id: "DeleteMessageConfirmation",
            style: ButtonStyle.Danger,
            label: "X"
        }).BuildActionRow();

        await channel.send({ content: `<@${user.id}>`, embeds: [embed_one], components: [action_row_one], allowedMentions: { parse: [ "users" ] } });
    };

    /**
     * Sends a moderation log message to the target user
     * 
     * @example
     * ```ts
     * await infraction_message.SendDM();
     * ```
     */
    public async SendDM(): Promise<void> {
        const user = await this._data.client.users.fetch(this._data.infraction.TargetID).catch(() => { return undefined });
        if (!user) return;

        const dm_enabled = await user.send(" ").catch((error) => error.code);
        if (dm_enabled === 50007) return;

        const content = {
            BanAdd: `You have been banned in **${this._data.guild.name}**!`,
            BanRemove: `Your ban in **${this._data.guild.name}** has been removed!`,
            BanSoft: `You have been soft banned in **${this._data.guild.name}**!`,
            Kick: `You have been kicked from **${this._data.guild.name}**!`,
            TimeoutAdd: `You have been timed out in **${this._data.guild.name}** for ${FormatTimeout(this._data.duration ?? 0)}!`,
            TimeoutRemove: `Your timeout in **${this._data.guild.name}** was removed!`,
            WarnAdd: `You have been warned in **${this._data.guild.name}**!`,
            WarnRemove: `Your warning has been removed in **${this._data.guild.name}**!`
        };

        const embed_one = new EmbedBuilder()
        .setThumbnail(user.displayAvatarURL({ forceStatic: false, size: 4096 }))
        .setAuthor({ name: `Case #${this._data.infraction.CaseID} | ${ActionType[this._data.type]}` })
        .addFields(
            { name: "Moderation Information", value: `${this._data.infraction.ActionID ? `- **Action ID** • ${this._data.infraction.ActionID}\n` : ""}- **Creation** • <t:${Math.trunc(Math.floor(Number(this._data.infraction.CreationTimestamp) / 1000))}:D>\n${this._data.duration ? `- **Duration** • ${FormatTimeout(this._data.duration)}\n` : ""}- **Status** • ${this._data.infraction.Active == true ? "Active" : "Inactive"}` },
            { name: "Reason", value: this._data.type === "WarnRemove" && this._data.infraction.RemovalReason ? this._data.infraction.RemovalReason : this._data.infraction.Reason }
        )
        .setColor(Color[this._data.type])

        const guild_moderation_setting = await FindOrCreateEntity(GuildModerationSetting, { Snowflake: this._data.guild.id });
        const action_row_one = [];

        if (guild_moderation_setting.AppealLink && guild_moderation_setting.AppealLinkStatus && (this._data.type === "BanAdd" || this._data.type === "TimeoutAdd" || this._data.type === "WarnAdd")) {
            action_row_one.push(new ButtonBuilder()
            .CreateLinkButton({
                custom_id: guild_moderation_setting.AppealLink,
                style: ButtonStyle.Link,
                label: "Appeal"
            }).BuildActionRow());
        };

        user.send({ content: content[this._data.type], embeds: [embed_one], components: action_row_one });
    };

    /**
     * Sends a modified moderation log message to the private/public log channel
     * @param {"Private" | "Public"} type - Whether to send a private or public log
     * 
     * @note Requires "modified" data strucutre to use
     * 
     * @example
     * ```ts
     * await infraction_message.SendModifiedWebhook("Private");
     * ```
     */
    public async SendModifiedWebhook(type: "Private" | "Public"): Promise<void> {
        if (!this._data.modified) return;
        const user = await this._data.client.users.fetch(this._data.infraction.TargetID).catch(() => { return undefined });
        if (!user) return;

        const guild_moderation_setting = await FindOrCreateEntity(GuildModerationSetting, { Snowflake: this._data.guild.id });
        const log_status = type === "Private" ? guild_moderation_setting.ModerationPrivateLogStatus : guild_moderation_setting.ModerationPublicLogStatus;
        const logging_channel = type === "Private" ? guild_moderation_setting.ModerationPrivateLogChannel : guild_moderation_setting.ModerationPublicLogChannel;
        const log_channel = await this._data.guild.channels.fetch(logging_channel).catch(() => { return undefined }) as TextChannel | NewsChannel | undefined;
        const logging_webhook = type === "Private" ? guild_moderation_setting.ModerationPrivateLogChannelWebhook : guild_moderation_setting.ModerationPublicLogChannelWebhook;

        if (!log_status || !await GuildChannelExist(this._data.guild, logging_channel) || !log_channel) return;

        const webhook_data = logging_webhook.split("[BlossomSplit]");
        const old_webhook = await this._data.client.fetchWebhook(webhook_data[0], webhook_data[1]).catch(() => { return undefined });
        let webhook_id;
        let webhook_token;

        if (old_webhook && log_channel.id === old_webhook.channelId) {
            if (await HasChannelPermissions(this._data.client, old_webhook.channelId, this._data.client.user.id, [ PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageWebhooks ])) old_webhook.delete(`Deleting ${this._data.client.user.username} old moderation log webhook`);
        };

        if (!await WebhookExist(this._data.client, webhook_data[0], webhook_data[1])) {
            if (!await HasChannelPermissions(this._data.client, logging_channel, this._data.client.user.id, [ PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageWebhooks ])) {
                webhook_id = webhook_data[0];
                webhook_token = webhook_data[1];
            } else {
                const new_webhook = await log_channel.createWebhook({
                    name: `${this._data.client.user.username}`,
                    avatar: this._data.client.user.displayAvatarURL({ forceStatic: false, size: 4096 }),
                    reason: `Creating ${this._data.client.user.username} moderation log webhook`
                });
                webhook_id = new_webhook.id;
                webhook_token = new_webhook.token as string;

                await UpdateEntity(GuildModerationSetting, { Snowflake: this._data.guild.id }, { [type === "Private" ? "ModerationPrivateLogChannelWebhook" : "ModerationPublicLogChannelWebhook"]: `${webhook_id}[BlossomSplit]${webhook_token}` });
            };
        } else {
            webhook_id = webhook_data[0];
            webhook_token = webhook_data[1];
        };

        const fields = [
            { name: "Moderation Information", value: `- **Action ID** • ${this._data.infraction.ActionID}\n- **Creation** • <t:${Math.trunc(Math.floor(Number(this._data.infraction.CreationTimestamp) / 1000))}:D>\n- **Status** • ${this._data.infraction.Active == true ? "Active" : "Inactive"}\n- **Staff Member** • ${this._data.infraction.StaffUsername} [\`${this._data.infraction.StaffID}\`]\n- **Target Member** • ${this._data.infraction.TargetUsername} [\`${this._data.infraction.TargetID}\`]` }
        ];

        if (this._data.modified.type === "MarkActive" && this._data.modified.reason) fields.push(
            { name: "Reason", value: this._data.infraction.Reason },
            { name: "Active Reason", value: this._data.modified.reason }
        );

        if (this._data.modified.type === "MarkInactive") fields.push(
            { name: "Reason", value: this._data.infraction.Reason },
            { name: "Removal Information", value: `- **Staff Member** • ${this._data.infraction.RemovalStaffUsername} [\`${this._data.infraction.RemovalStaffID}\`]` },
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
        .setAuthor({ name: `Case #${this._data.infraction.CaseID} | ${ActionType[this._data.type]}` })
        .setFields(fields)
        .setColor(Color[this._data.infraction.Type as InfractionType]);

        if (!await WebhookExist(this._data.client, webhook_id, webhook_token)) return;

        const webhook = new WebhookClient({ id: webhook_id, token: webhook_token });
        await webhook.send({ embeds: [embed_one] });
    };

    /**
     * Sends a moderation log message to the private/public log channel
     * @param {"Private" | "Public"} type - Whether to send a private or public log
     * 
     * @example
     * ```ts
     * await infraction_message.SendWebhook("Private");
     * ```
     */
    public async SendWebhook(type: "Private" | "Public"): Promise<void> {
        const user = await this._data.client.users.fetch(this._data.infraction.TargetID).catch(() => { return undefined });
        if (!user) return;

        const guild_moderation_setting = await FindOrCreateEntity(GuildModerationSetting, { Snowflake: this._data.guild.id });
        const log_status = type === "Private" ? guild_moderation_setting.ModerationPrivateLogStatus : guild_moderation_setting.ModerationPublicLogStatus;
        const logging_channel = type === "Private" ? guild_moderation_setting.ModerationPrivateLogChannel : guild_moderation_setting.ModerationPublicLogChannel;
        const log_channel = await this._data.guild.channels.fetch(logging_channel).catch(() => { return undefined }) as TextChannel | NewsChannel | undefined;
        const logging_webhook = type === "Private" ? guild_moderation_setting.ModerationPrivateLogChannelWebhook : guild_moderation_setting.ModerationPublicLogChannelWebhook;

        if (!log_status || !await GuildChannelExist(this._data.guild, logging_channel) || !log_channel) return;

        const webhook_data = logging_webhook.split("[BlossomSplit]");
        const old_webhook = await this._data.client.fetchWebhook(webhook_data[0], webhook_data[1]).catch(() => { return undefined });
        let webhook_id;
        let webhook_token;

        if (old_webhook && log_channel.id === old_webhook.channelId) {
            if (await HasChannelPermissions(this._data.client, old_webhook.channelId, this._data.client.user.id, [ PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageWebhooks ])) old_webhook.delete(`Deleting ${this._data.client.user.username} old moderation log webhook`);
        };

        if (!await WebhookExist(this._data.client, webhook_data[0], webhook_data[1])) {
            if (!await HasChannelPermissions(this._data.client, logging_channel, this._data.client.user.id, [ PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageWebhooks ])) {
                webhook_id = webhook_data[0];
                webhook_token = webhook_data[1];
            } else {
                const new_webhook = await log_channel.createWebhook({
                    name: `${this._data.client.user.username}`,
                    avatar: this._data.client.user.displayAvatarURL({ forceStatic: false, size: 4096 }),
                    reason: `Creating ${this._data.client.user.username} moderation log webhook`
                });
                webhook_id = new_webhook.id;
                webhook_token = new_webhook.token as string;

                await UpdateEntity(GuildModerationSetting, { Snowflake: this._data.guild.id }, { [type === "Private" ? "ModerationPrivateLogChannelWebhook" : "ModerationPublicLogChannelWebhook"]: `${webhook_id}[BlossomSplit]${webhook_token}` });
            };
        } else {
            webhook_id = webhook_data[0];
            webhook_token = webhook_data[1];
        };

        const embed_one = new EmbedBuilder()
        .setThumbnail(user.displayAvatarURL({ forceStatic: false, size: 4096 }))
        .setAuthor({ name: `Case #${this._data.infraction.CaseID} | ${ActionType[this._data.type]}` })
        .addFields(
            { name: "Moderation Information", value: `${this._data.infraction.ActionID ? `- **Action ID** • ${this._data.infraction.ActionID}\n` : ""}- **Creation** • <t:${Math.trunc(Math.floor(Number(this._data.infraction.CreationTimestamp) / 1000))}:D>\n${this._data.duration ? `- **Duration** • ${FormatTimeout(this._data.duration)}\n` : ""}- **Status** • ${this._data.infraction.Active == true ? "Active" : "Inactive"}\n- **Staff Member** • ${this._data.infraction.StaffUsername} [\`${this._data.infraction.StaffID}\`]\n- **Target Member** • ${this._data.infraction.TargetUsername} [\`${this._data.infraction.TargetID}\`]` },
            { name: "Reason", value: this._data.type === "WarnRemove" && this._data.infraction.RemovalReason ? this._data.infraction.RemovalReason : this._data.infraction.Reason }
        )
        .setColor(Color[this._data.type]);

        if (!await WebhookExist(this._data.client, webhook_id, webhook_token)) return;

        const webhook = new WebhookClient({ id: webhook_id, token: webhook_token });
        await webhook.send({ embeds: [embed_one] });
    };
};