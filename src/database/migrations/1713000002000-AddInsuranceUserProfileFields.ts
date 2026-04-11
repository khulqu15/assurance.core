import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInsuranceUserProfileFields1713000002000 implements MigrationInterface {
    name = 'AddInsuranceUserProfileFields1713000002000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD COLUMN "phone_number" character varying(20)
        `);

        await queryRunner.query(`
            ALTER TABLE "users"
            ADD COLUMN "nik" character varying(30)
        `);

        await queryRunner.query(`
            ALTER TABLE "users"
            ADD COLUMN "birth_place" character varying(100)
        `);

        await queryRunner.query(`
            ALTER TABLE "users"
            ADD COLUMN "birth_date" date
        `);

        await queryRunner.query(`
            ALTER TABLE "users"
            ADD COLUMN "address" text
        `);

        await queryRunner.query(`
            ALTER TABLE "users"
            ADD COLUMN "city" character varying(100)
        `);

        await queryRunner.query(`
            ALTER TABLE "users"
            ADD COLUMN "province" character varying(100)
        `);

        await queryRunner.query(`
            ALTER TABLE "users"
            ADD COLUMN "postal_code" character varying(10)
        `);

        await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "UQ_users_nik" UNIQUE ("nik")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_users_nik"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "postal_code"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "province"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "city"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "birth_date"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "birth_place"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "nik"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone_number"`);
    }
}