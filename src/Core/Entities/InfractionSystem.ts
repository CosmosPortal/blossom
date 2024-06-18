import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GuildSystem } from "./GuildSystem";

@Entity({ name: "InfractionSystem" })
export class InfractionSystem {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    ActionID!: string;

    @Column()
    Active!: boolean;

    @Column()
    CaseID!: number;

    @Column()
    CreationTimestamp!: string;

    @Column({ nullable: true })
    EvidenceAttachmentURL!: string;

    @Column()
    InfractionGuildID!: string;

    @Column()
    Reason!: string;

    @Column({ nullable: true })
    RemovalReason!: string;

    @Column({ nullable: true })
    RemovalStaffID!: string;

    @Column({ nullable: true })
    RemovalStaffUsername!: string;

    @Column()
    StaffID!: string;

    @Column()
    StaffUsername!: string;

    @Column()
    TargetID!: string;

    @Column()
    TargetUsername!: string;

    @Column()
    Type!: string;

    @ManyToOne(() => GuildSystem, (guild_system) => guild_system.Infractions)
    Guild!: GuildSystem;
};