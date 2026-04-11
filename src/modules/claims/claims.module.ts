import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClaimsController } from './claims.controller';
import { ClaimsService } from './claims.service';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { AttachmentsController } from './attachments.controller';
import { AttachmentsService } from './attachments.service';
import { HistoriesController } from './histories.controller';
import { HistoriesService } from './histories.service';
import { ClaimStatusesController } from './claim-statuses.controller';
import { ClaimStatusesService } from './claim-statuses.service';

import { Claim } from './entities/claim.entity';
import { ClaimStatus } from './entities/claim-status.entity';
import { ClaimStatusHistory } from './entities/claim-status-history.entity';
import { ClaimAttachment } from './entities/claim-attachment.entity';
import { ClaimComment } from './entities/claim-comment.entity';
import { IdempotencyKey } from './entities/idempotency-key.entity';

import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { UserRole } from '../users/entities/user-role.entity';
import { EmailModule } from '../email/email.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Claim,
            ClaimStatus,
            ClaimStatusHistory,
            ClaimAttachment,
            ClaimComment,
            IdempotencyKey,
            User,
            Role,
            UserRole,
        ]),
        EmailModule
    ],
    controllers: [
        ClaimsController,
        CommentsController,
        AttachmentsController,
        HistoriesController,
        ClaimStatusesController,
    ],
    providers: [
        ClaimsService,
        CommentsService,
        AttachmentsService,
        HistoriesService,
        ClaimStatusesService,
    ],
    exports: [ClaimsService],
})
export class ClaimsModule {}