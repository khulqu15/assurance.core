import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixClaimAttachmentsColumns1713000004000 implements MigrationInterface {
  name = 'FixClaimAttachmentsColumns1713000004000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasOriginalFileName = await queryRunner.hasColumn(
      'claim_attachments',
      'original_file_name',
    );

    if (!hasOriginalFileName) {
      const hasOldFileName = await queryRunner.hasColumn(
        'claim_attachments',
        'file_name',
      );

      if (hasOldFileName) {
        await queryRunner.query(`
          ALTER TABLE "claim_attachments"
          RENAME COLUMN "file_name" TO "original_file_name"
        `);
      } else {
        await queryRunner.query(`
          ALTER TABLE "claim_attachments"
          ADD COLUMN "original_file_name" character varying(255)
        `);
      }
    }

    const hasStoredFileName = await queryRunner.hasColumn(
      'claim_attachments',
      'stored_file_name',
    );

    if (!hasStoredFileName) {
      await queryRunner.query(`
        ALTER TABLE "claim_attachments"
        ADD COLUMN "stored_file_name" character varying(255)
      `);
    }

    const hasFileExtension = await queryRunner.hasColumn(
      'claim_attachments',
      'file_extension',
    );

    if (!hasFileExtension) {
      await queryRunner.query(`
        ALTER TABLE "claim_attachments"
        ADD COLUMN "file_extension" character varying(20)
      `);
    }

    const hasStorageDisk = await queryRunner.hasColumn(
      'claim_attachments',
      'storage_disk',
    );

    if (!hasStorageDisk) {
      await queryRunner.query(`
        ALTER TABLE "claim_attachments"
        ADD COLUMN "storage_disk" character varying(50) NOT NULL DEFAULT 'local'
      `);
    }

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
      ALTER COLUMN "original_file_name" SET NOT NULL
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
    const hasOldOriginalFileName = await queryRunner.hasColumn(
      'claim_attachments',
      'original_file_name',
    );

    if (hasOldOriginalFileName) {
      const hasOldFileName = await queryRunner.hasColumn(
        'claim_attachments',
        'file_name',
      );

      if (!hasOldFileName) {
        await queryRunner.query(`
          ALTER TABLE "claim_attachments"
          RENAME COLUMN "original_file_name" TO "file_name"
        `);
      }
    }

    const hasStoredFileName = await queryRunner.hasColumn(
      'claim_attachments',
      'stored_file_name',
    );

    if (hasStoredFileName) {
      await queryRunner.query(`
        ALTER TABLE "claim_attachments"
        DROP COLUMN "stored_file_name"
      `);
    }

    const hasFileExtension = await queryRunner.hasColumn(
      'claim_attachments',
      'file_extension',
    );

    if (hasFileExtension) {
      await queryRunner.query(`
        ALTER TABLE "claim_attachments"
        DROP COLUMN "file_extension"
      `);
    }

    const hasStorageDisk = await queryRunner.hasColumn(
      'claim_attachments',
      'storage_disk',
    );

    if (hasStorageDisk) {
      await queryRunner.query(`
        ALTER TABLE "claim_attachments"
        DROP COLUMN "storage_disk"
      `);
    }
  }
}