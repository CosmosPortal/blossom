import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "Developer" })
export class Developer {
    @PrimaryColumn()
    snowflake!: string;

    @Column({ default: false })
    MaintenanceModeStatus!: boolean;
};