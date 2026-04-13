import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserTokensAndEmailVerified1713000001000 implements MigrationInterface {
    name = 'AddUserTokensAndEmailVerified1713000001000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD COLUMN "email_verified_at" TIMESTAMPTZ
        `);

        await queryRunner.query(`
            CREATE TABLE "user_tokens" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "type" character varying(50) NOT NULL,
                "token" text NOT NULL,
                "is_used" boolean NOT NULL DEFAULT false,
                "expires_at" TIMESTAMPTZ NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_user_tokens_token" UNIQUE ("token"),
                CONSTRAINT "PK_user_tokens_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "user_tokens"
            ADD CONSTRAINT "FK_user_tokens_user"
            FOREIGN KEY ("user_id") REFERENCES "users"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user_tokens"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email_verified_at"`);
    }
}