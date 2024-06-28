import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GuildSystem } from "./GuildSystem";

@Entity({ name: "ReportSystem" })
export class ReportSystem {
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

    @Column({ nullable: true })
    FlaggedChannelID!: string;

    @Column({ nullable: true })
    FlaggedMessageID!: string;

    @Column()
    Guild_ID!: string;

    @Column()
    HasBanAddLogged!: boolean;

    @Column()
    HasKickLogged!: boolean;

    @Column()
    HasTimeoutAddLogged!: boolean;

    @Column()
    HasWarnAddLogged!: boolean;

    @Column()
    HasWarnVerbalLogged!: boolean;

    @Column()
    IsMessageDeleted!: boolean;

    @Column()
    Reason!: string;

    @Column()
    ReportChannelID!: string;

    @Column()
    ReporterID!: string;

    @Column()
    ReporterUsername!: string;

    @Column()
    ReportMessageID!: string;

    @Column()
    TargetID!: string;

    @Column()
    TargetUsername!: string;

    @Column()
    Type!: string;

    @ManyToOne(() => GuildSystem, (guild_system) => guild_system.Reports)
    Guild!: GuildSystem;
};