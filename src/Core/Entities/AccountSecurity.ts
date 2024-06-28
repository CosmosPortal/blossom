import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "AccountSecurity" })
export class AccountSecurity {
    @PrimaryColumn()
    Snowflake!: string;

    @Column({ default: 1 })
    AccountType!: number;

    @Column({ default: 1 })
    AuthorizationLevel!: number;

    @Column({ default: false })
    MemberAgreementPrivacyPolicy!: boolean;

    @Column({ default: false })
    MemberAgreementTermsofService!: boolean;

    @Column({ default: true })
    NewMemberAgreement!: boolean;
};