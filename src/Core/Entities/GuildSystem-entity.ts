import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { InfractionSystem } from "./InfractionSystem-entity";
import { ReportSystem } from "./ReportSystem-entity";
import { TagSystem } from "./TagSystem-entity";

@Entity({ name: "GuildSystem" })
export class GuildSystem {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    Snowflake!: string;

    @OneToMany(() => InfractionSystem, (infraction_system) => infraction_system.Guild)
    Infractions!: InfractionSystem[];

    @OneToMany(() => ReportSystem, (report_system) => report_system.Guild)
    Reports!: ReportSystem[];

    @OneToMany(() => TagSystem, (tag_system) => tag_system.Guild)
    Tags!: TagSystem[];
};