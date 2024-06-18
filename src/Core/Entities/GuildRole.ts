import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "GuildRole" })
export class GuildRole {
    @PrimaryColumn()
    Snowflake!: string;

    @Column({ default: "0" })
    StaffTeamGuildAppManager!: string;

    @Column({ default: "0" })
    StaffTeamGuildManager!: string;

    @Column({ default: "0" })
    StaffTeamGuildModerator!: string;

    @Column({ default: "0" })
    StaffTeamGuildOwner!: string;
};