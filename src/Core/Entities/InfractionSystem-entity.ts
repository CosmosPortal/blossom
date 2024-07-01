import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GuildSystem } from "./GuildSystem-entity";

@Entity({ name: "InfractionSystem" })
export class InfractionSystem {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    Active!: boolean;

    @Column()
    BlossomID!: string;

    @Column()
    CaseID!: number;

    @Column()
    CreationTimestamp!: number;

    @Column({ nullable: true })
    EvidenceAttachmentURL!: string;

    @Column()
    Guild_ID!: string;

    @Column()
    Reason!: string;

    @Column({ nullable: true })
    RemovalReason!: string;

    @Column({ nullable: true })
    RemovalStaffID!: string;

    @Column()
    StaffID!: string;

    @Column()
    TargetID!: string;

    @Column()
    Type!: string;

    @ManyToOne(() => GuildSystem, (guild_system) => guild_system.Infractions)
    Guild!: GuildSystem;
};