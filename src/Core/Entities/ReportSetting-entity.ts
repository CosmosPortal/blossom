import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "ReportSetting" })
export class ReportSetting {
    @PrimaryColumn()
    Snowflake!: string;

    @Column({ default: "0" })
    MessageReportChannel!: string;

    @Column({ default: true })
    MessageReportNotifiedStaffTeam!: boolean;

    @Column({ default: false })
    MessageReportStatus!: boolean;

    @Column({ default: false })
    MessageReportThreadMode!: boolean;

    @Column({ default: "0" })
    UserReportChannel!: string;

    @Column({ default: true })
    UserReportNotifiedStaffTeam!: boolean;

    @Column({ default: false })
    UserReportStatus!: boolean;

    @Column({ default: false })
    UserReportThreadMode!: boolean;
};