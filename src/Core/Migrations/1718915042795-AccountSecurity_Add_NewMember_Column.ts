import { TableColumn, type MigrationInterface, type QueryRunner } from "typeorm";

export class AccountSecurityAddNewMemberColumn1718915042795 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("AccountSecurity", new TableColumn({
            name: "NewMember",
            type: "boolean",
            default: true
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("AccountSecurity", "NewMember");
    }

}
