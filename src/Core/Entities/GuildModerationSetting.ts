import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "GuildModerationSetting" })
export class GuildModerationSetting {
    @PrimaryColumn()
    snowflake!: string;

    @Column({ nullable: true })
    AppealLink!: string;

    @Column({ default: false })
    AppealLinkStatus!: boolean;

    @Column({ default: 0 })
    BanDeleteMessagesHistory!: number;

    @Column({ default: false })
    ModerationConfirmationMessage!: boolean;

    @Column({ default: "0" })
    ModerationPrivateLogChannel!: string;

    @Column({ default: false })
    ModerationPrivateLogStatus!: boolean;

    @Column({ default: "0" })
    ModerationPublicLogChannel!: string;

    @Column({ default: false })
    ModerationPublicLogStatus!: boolean;

    @Column({ default: "0" })
    ReportMessageChannel!: string;

    @Column({ default: false })
    ReportMessageStatus!: boolean;

    @Column({ default: "0" })
    ReportUserChannel!: string;

    @Column({ default: false })
    ReportUserStatus!: boolean;

    @Column({ default: false })
    RequireReason!: boolean;

    @Column({ default: 3600 })
    TimeoutTimer!: number;
};