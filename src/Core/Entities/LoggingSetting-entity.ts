import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "LoggingSetting" })
export class LoggingSetting {
    @PrimaryColumn()
    Snowflake!: string;

    @Column({ default: "0" })
    ModerationPrivateLogChannel!: string;

    @Column({ default: false })
    ModerationPrivateLogStatus!: boolean;

    @Column({ default: "0[Split]0" })
    ModerationPrivateLogWebhook!: string;

    @Column({ default: "0" })
    ModerationPublicLogChannel!: string;

    @Column({ default: false })
    ModerationPublicLogStatus!: boolean;

    @Column({ default: "0[Split]0" })
    ModerationPublicLogWebhook!: string;
};