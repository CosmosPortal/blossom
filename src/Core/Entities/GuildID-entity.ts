import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "GuildID" })
export class GuildID {
    @PrimaryColumn()
    Snowflake!: string;

    @Column({ default: 0 })
    InfractionCreation!: number;

    @Column({ default: 0 })
    ReportCreation!: number;
};