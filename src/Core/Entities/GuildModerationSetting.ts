import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "GuildModerationSetting" })
export class GuildModerationSetting {
    @PrimaryColumn()
    Snowflake!: string;

    @Column({ nullable: true })
    AppealLink!: string;

    @Column({ default: false })
    AppealLinkStatus!: boolean;

    @Column({ default: 0 })
    BanDeleteMessagesHistory!: number;

    @Column({ default: "0" })
    MessageReportChannel!: string;

    @Column({ default: false })
    MessageReportStatus!: boolean;

    @Column({ default: false })
    ModerationConfirmationMessage!: boolean;

    @Column({ default: "0" })
    ModerationPrivateLogChannel!: string;

    @Column({ default: "0[BlossomSplit]0" })
    ModerationPrivateLogChannelWebhook!: string;

    @Column({ default: false })
    ModerationPrivateLogStatus!: boolean;

    @Column({ default: "0" })
    ModerationPublicLogChannel!: string;

    @Column({ default: "0[BlossomSplit]0" })
    ModerationPublicLogChannelWebhook!: string;

    @Column({ default: false })
    ModerationPublicLogStatus!: boolean;

    @Column({ default: false })
    RequireReason!: boolean;

    @Column({ default: 3600 })
    TimeoutTimer!: number;

    @Column({ default: "0" })
    UserReportChannel!: string;

    @Column({ default: false })
    UserReportStatus!: boolean;
};