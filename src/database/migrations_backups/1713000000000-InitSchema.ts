import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1713000000000 implements MigrationInterface {
    name = 'InitSchema1713000000000';
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "full_name" character varying(150) NOT NULL,
                "email" character varying(255) NOT NULL,
                "password_hash" text NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_users_email" UNIQUE ("email"),
                CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "roles" (
                "id" SMALLSERIAL NOT NULL,
                "code" character varying(50) NOT NULL,
                "name" character varying(100) NOT NULL,
                CONSTRAINT "UQ_roles_code" UNIQUE ("code"),
                CONSTRAINT "PK_roles_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "user_roles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "role_id" smallint NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "uq_user_roles_user_role" UNIQUE ("user_id", "role_id"),
                CONSTRAINT "PK_user_roles_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "claim_statuses" (
                "id" SMALLSERIAL NOT NULL,
                "code" character varying(50) NOT NULL,
                "name" character varying(100) NOT NULL,
                "sequence" smallint NOT NULL,
                CONSTRAINT "UQ_claim_statuses_code" UNIQUE ("code"),
                CONSTRAINT "PK_claim_statuses_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "claims" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "claim_number" character varying(50) NOT NULL,
                "user_id" uuid NOT NULL,
                "title" character varying(200) NOT NULL,
                "description" text,
                "claim_amount" numeric(18,2) NOT NULL,
                "incident_date" date NOT NULL,
                "current_status_id" smallint NOT NULL,
                "submitted_at" TIMESTAMPTZ,
                "reviewed_at" TIMESTAMPTZ,
                "decided_at" TIMESTAMPTZ,
                "reviewed_by" uuid,
                "decided_by" uuid,
                "rejection_reason" text,
                "version" integer NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "UQ_claims_claim_number" UNIQUE ("claim_number"),
                CONSTRAINT "PK_claims_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "claim_status_histories" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "claim_id" uuid NOT NULL,
                "from_status_id" smallint,
                "to_status_id" smallint NOT NULL,
                "action_by" uuid NOT NULL,
                "action_role" character varying(50) NOT NULL,
                "note" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_claim_status_histories_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "claim_attachments" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "claim_id" uuid NOT NULL,
                "file_name" character varying(255) NOT NULL,
                "file_url" text NOT NULL,
                "file_mime_type" character varying(100) NOT NULL,
                "file_size" bigint NOT NULL,
                "uploaded_by" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_claim_attachments_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "claim_comments" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "claim_id" uuid NOT NULL,
                "comment_type" character varying(30) NOT NULL,
                "comment_text" text NOT NULL,
                "created_by" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_claim_comments_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "idempotency_keys" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "key" character varying(255) NOT NULL,
                "actor_id" uuid NOT NULL,
                "resource_type" character varying(100) NOT NULL,
                "resource_id" uuid,
                "request_hash" text NOT NULL,
                "response_code" integer,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "expired_at" TIMESTAMPTZ NOT NULL,
                CONSTRAINT "UQ_idempotency_keys_key" UNIQUE ("key"),
                CONSTRAINT "PK_idempotency_keys_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_claims_user_id" ON "claims" ("user_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_claims_current_status_id" ON "claims" ("current_status_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_claim_status_histories_claim_id" ON "claim_status_histories" ("claim_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_claim_attachments_claim_id" ON "claim_attachments" ("claim_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_claim_comments_claim_id" ON "claim_comments" ("claim_id")
        `);

        await queryRunner.query(`
            ALTER TABLE "user_roles"
            ADD CONSTRAINT "FK_user_roles_user"
            FOREIGN KEY ("user_id") REFERENCES "users"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "user_roles"
            ADD CONSTRAINT "FK_user_roles_role"
            FOREIGN KEY ("role_id") REFERENCES "roles"("id")
            ON DELETE RESTRICT ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "claims"
            ADD CONSTRAINT "FK_claims_user"
            FOREIGN KEY ("user_id") REFERENCES "users"("id")
            ON DELETE RESTRICT ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "claims"
            ADD CONSTRAINT "FK_claims_current_status"
            FOREIGN KEY ("current_status_id") REFERENCES "claim_statuses"("id")
            ON DELETE RESTRICT ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "claims"
            ADD CONSTRAINT "FK_claims_reviewed_by"
            FOREIGN KEY ("reviewed_by") REFERENCES "users"("id")
            ON DELETE RESTRICT ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "claims"
            ADD CONSTRAINT "FK_claims_decided_by"
            FOREIGN KEY ("decided_by") REFERENCES "users"("id")
            ON DELETE RESTRICT ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "claim_status_histories"
            ADD CONSTRAINT "FK_histories_claim"
            FOREIGN KEY ("claim_id") REFERENCES "claims"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "claim_status_histories"
            ADD CONSTRAINT "FK_histories_from_status"
            FOREIGN KEY ("from_status_id") REFERENCES "claim_statuses"("id")
            ON DELETE RESTRICT ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "claim_status_histories"
            ADD CONSTRAINT "FK_histories_to_status"
            FOREIGN KEY ("to_status_id") REFERENCES "claim_statuses"("id")
            ON DELETE RESTRICT ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "claim_status_histories"
            ADD CONSTRAINT "FK_histories_action_by"
            FOREIGN KEY ("action_by") REFERENCES "users"("id")
            ON DELETE RESTRICT ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "claim_attachments"
            ADD CONSTRAINT "FK_attachments_claim"
            FOREIGN KEY ("claim_id") REFERENCES "claims"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "claim_attachments"
            ADD CONSTRAINT "FK_attachments_uploaded_by"
            FOREIGN KEY ("uploaded_by") REFERENCES "users"("id")
            ON DELETE RESTRICT ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "claim_comments"
            ADD CONSTRAINT "FK_comments_claim"
            FOREIGN KEY ("claim_id") REFERENCES "claims"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "claim_comments"
            ADD CONSTRAINT "FK_comments_created_by"
            FOREIGN KEY ("created_by") REFERENCES "users"("id")
            ON DELETE RESTRICT ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "idempotency_keys"
            ADD CONSTRAINT "FK_idempotency_actor"
            FOREIGN KEY ("actor_id") REFERENCES "users"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            INSERT INTO roles (id, code, name) VALUES
            (1, 'user', 'User'),
            (2, 'verifier', 'Verifier'),
            (3, 'approver', 'Approver'),
            (4, 'superadmin', 'Super Admin')
            ON CONFLICT (code) DO NOTHING;
        `);

        await queryRunner.query(`
            INSERT INTO "claim_statuses" ("id", "code", "name", "sequence") VALUES
            (1, 'draft', 'Draft', 1),
            (2, 'submitted', 'Submitted', 2),
            (3, 'reviewed', 'Reviewed', 3),
            (4, 'approved', 'Approved', 4),
            (5, 'rejected', 'Rejected', 4)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "idempotency_keys"`);
        await queryRunner.query(`DROP TABLE "claim_comments"`);
        await queryRunner.query(`DROP TABLE "claim_attachments"`);
        await queryRunner.query(`DROP TABLE "claim_status_histories"`);
        await queryRunner.query(`DROP TABLE "claims"`);
        await queryRunner.query(`DROP TABLE "claim_statuses"`);
        await queryRunner.query(`DROP TABLE "user_roles"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }
}