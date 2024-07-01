import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "TicketSetting" })
export class TicketSetting {
    @PrimaryColumn()
    Snowflake!: string;

    @Column({ default: false })
    GrantNonStaffInviteAccess!: boolean;

    @Column({ default: false })
    MentionCreatorForReply!: boolean;

    @Column({ default: false })
    NotifiedStaffTeam!: boolean;

    @Column({ default: false })
    RequireSubject!: boolean;

    @Column({ default: false })
    RequireTwoStepClosure!: boolean;

    @Column({ default: false })
    ThreadMode!: boolean;

    @Column({ default: false })
    TicketStatus!: boolean;
};