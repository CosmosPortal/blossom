import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "MemberID" })
export class MemberID {
    @PrimaryColumn()
    Snowflake!: string;

    @Column({ default: 0 })
    WarnInfraction!: number;
};