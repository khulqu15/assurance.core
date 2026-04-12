import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { User } from './modules/users/entities/user.entity';
import { Role } from './modules/users/entities/role.entity';
import { UserRole } from './modules/users/entities/user-role.entity';
import { UserToken } from './modules/users/user-token.entity';
import { UserSettings } from './modules/users/entities/user-settings.entity';

import { Claim } from './modules/claims/entities/claim.entity';
import { ClaimStatus } from './modules/claims/entities/claim-status.entity';
import { ClaimStatusHistory } from './modules/claims/entities/claim-status-history.entity';
import { ClaimAttachment } from './modules/claims/entities/claim-attachment.entity';
import { ClaimComment } from './modules/claims/entities/claim-comment.entity';
import { IdempotencyKey } from './modules/claims/entities/idempotency-key.entity';

export const databaseConfig = (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'insurance_approval',
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
    synchronize: false,
    logging: false,
});