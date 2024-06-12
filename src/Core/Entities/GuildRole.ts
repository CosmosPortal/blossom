import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "GuildRole" })
export class GuildRole {
    @PrimaryColumn()
    snowflake!: string;

    @Column({ default: "0" })
    StaffTeamGuildBotManager!: string;

    @Column({ default: "0" })
    StaffTeamGuildManager!: string;

    @Column({ default: "0" })
    StaffTeamGuildOwner!: string;
};