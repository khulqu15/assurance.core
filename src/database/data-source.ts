import 'dotenv/config';
import { DataSource } from 'typeorm';
import { join } from 'path';

import { User } from '../modules/users/entities/user.entity';
import { Role } from '../modules/users/entities/role.entity';
import { UserRole } from '../modules/users/entities/user-role.entity';
import { UserToken } from '../modules/users/user-token.entity';
import { UserSettings } from '../modules/users/entities/user-settings.entity';

import { Claim } from '../modules/claims/entities/claim.entity';
import { ClaimStatus } from '../modules/claims/entities/claim-status.entity';
import { ClaimStatusHistory } from '../modules/claims/entities/claim-status-history.entity';
import { ClaimAttachment } from '../modules/claims/entities/claim-attachment.entity';
import { ClaimComment } from '../modules/claims/entities/claim-comment.entity';
import { IdempotencyKey } from '../modules/claims/entities/idempotency-key.entity';

const isTs = __filename.endsWith('.ts');

const resolveSqlitePath = () => {
  if (process.env.SQLITE_PATH) {
    return process.env.SQLITE_PATH;
  }

  if (process.env.RAILWAY_VOLUME_MOUNT_PATH) {
    return join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'data.sqlite');
  }

  return join(process.cwd(), 'data', 'data.sqlite');
};

export default new DataSource({
  type: 'better-sqlite3',
  database: resolveSqlitePath(),
  entities: [
    User,
    Role,
    UserRole,
    UserToken,
    UserSettings,
    Claim,
    ClaimStatus,
    ClaimStatusHistory,
    ClaimAttachment,
    ClaimComment,
    IdempotencyKey,
  ],
  migrations: [
    isTs
      ? join(__dirname, 'migrations', '*.ts')
      : join(__dirname, 'migrations', '*.js'),
  ],
  synchronize: false,
  logging: false,
  timeout: 5000,
  enableWAL: true,
});