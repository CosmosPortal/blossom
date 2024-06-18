import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "AccountSecurity" })
export class AccountSecurity {
    @PrimaryColumn()
    Snowflake!: string;

    @Column({ default: 1 })
    AccountType!: number;

    @Column({ default: 1 })
    AuthorizationLevel!: number;
};