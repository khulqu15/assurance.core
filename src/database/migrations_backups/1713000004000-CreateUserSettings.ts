import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserSettings1713000004000 implements MigrationInterface {
  name = 'CreateUserSettings1713000004000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_settings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "email_notification" boolean NOT NULL DEFAULT true,
        "push_notification" boolean NOT NULL DEFAULT false,
        "claim_status_notification" boolean NOT NULL DEFAULT true,
        "approval_decision_notification" boolean NOT NULL DEFAULT true,
        "weekly_summary" boolean NOT NULL DEFAULT true,
        "theme" character varying(20) NOT NULL DEFAULT 'light',
        "language" character varying(10) NOT NULL DEFAULT 'en',
        "default_page" character varying(30) NOT NULL DEFAULT 'dashboard',
        "rows_per_page" integer NOT NULL DEFAULT 25,
        "remember_session" boolean NOT NULL DEFAULT true,
        "two_factor_auth" boolean NOT NULL DEFAULT false,
        "login_alert" boolean NOT NULL DEFAULT true,
        "auto_logout" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_settings_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_settings_user_id" UNIQUE ("user_id"),
        CONSTRAINT "FK_user_settings_user_id" FOREIGN KEY ("user_id")
          REFERENCES "users"("id")
          ON DELETE CASCADE
          ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "user_settings"
    `);
  }
}