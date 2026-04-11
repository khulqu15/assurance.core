import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnhanceClaimAttachments1713000003000 implements MigrationInterface {
  name = 'EnhanceClaimAttachments1713000003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "claim_attachments"
      RENAME COLUMN "file_name" TO "original_file_name"
    `);

    await queryRunner.query(`
      ALTER TABLE "claim_attachments"
      ADD COLUMN "stored_file_name" character varying(255)
    `);

    await queryRunner.query(`
      ALTER TABLE "claim_attachments"
      ADD COLUMN "file_extension" character varying(20)
    `);

    await queryRunner.query(`
      ALTER TABLE "claim_attachments"
      ADD COLUMN "storage_disk" character varying(50) NOT NULL DEFAULT 'local'
    `);

    await queryRunner.query(`
      UPDATE "claim_attachments"
      SET "stored_file_name" = "original_file_name"
      WHERE "stored_file_name" IS NULL
    `);

    await queryRunner.query(`
      UPDATE "claim_attachments"
      SET "file_extension" = ''
      WHERE "file_extension" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "claim_attachments"
      ALTER COLUMN "stored_file_name" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "claim_attachments"
      ALTER COLUMN "file_extension" SET NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "claim_attachments"
      DROP COLUMN "storage_disk"
    `);

    await queryRunner.query(`
      ALTER TABLE "claim_attachments"
      DROP COLUMN "file_extension"
    `);

    await queryRunner.query(`
      ALTER TABLE "claim_attachments"
      DROP COLUMN "stored_file_name"
    `);

    await queryRunner.query(`
      ALTER TABLE "claim_attachments"
      RENAME COLUMN "original_file_name" TO "file_name"
    `);
  }
}