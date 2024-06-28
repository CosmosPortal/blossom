import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "ModerationSetting" })
export class ModerationSetting {
    @PrimaryColumn()
    Snowflake!: string;

    @Column({ default: 0 })
    BanDeleteMessagesHistory!: number;

    @Column({ default: false })
    ConfirmationMessage!: boolean;

    @Column({ default: false })
    RequireReason!: boolean;

    @Column({ default: 3600 })
    TimeoutTimer!: number;
};