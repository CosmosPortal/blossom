import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "AppealSetting" })
export class AppealSetting {
    @PrimaryColumn()
    Snowflake!: string;

    @Column({ nullable: true })
    AppealLink!: string;

    @Column({ default: false })
    AppealLinkStatus!: boolean;
};