import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GuildSystem } from "./GuildSystem-entity";

@Entity({ name: "TagSystem" })
export class TagSystem {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    BlossomID!: string;

    @Column()
    Content!: string;

    @Column()
    CreationTimestamp!: number;

    @Column()
    CreatorID!: string;

    @Column()
    Guild_ID!: string;

    @Column()
    Name!: string;

    @Column({ default: false })
    RequireStaffRole!: boolean;

    @Column({ default: 0 })
    UsageCount!: number;

    @ManyToOne(() => GuildSystem, (guild_system) => guild_system.Tags)
    Guild!: GuildSystem;
};