import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Claim } from './entities/claim.entity';
import { ClaimStatus } from './entities/claim-status.entity';
import { ClaimStatusHistory } from './entities/claim-status-history.entity';
import { ClaimAttachment } from './entities/claim-attachment.entity';
import { ClaimComment } from './entities/claim-comment.entity';
import { IdempotencyKey } from './entities/idempotency-key.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/user-role.entity';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { SubmitClaimDto } from './dto/submit-claim.dto';
import { ReviewClaimDto } from './dto/review-claim.dto';
import { DecisionClaimDto } from './dto/decision-claim.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ClaimStatusCode } from '../../common/enums/claim-status.enum';
import { RoleCode } from '../../common/enums/role.enum';
import { EmailService } from '../email/email.service';

@Injectable()
export class ClaimsService {
    constructor(
        @InjectRepository(Claim)
        private readonly claimRepository: Repository<Claim>,
        @InjectRepository(ClaimStatus)
        private readonly claimStatusRepository: Repository<ClaimStatus>,
        @InjectRepository(ClaimStatusHistory)
        private readonly claimStatusHistoryRepository: Repository<ClaimStatusHistory>,
        @InjectRepository(ClaimComment)
        private readonly claimCommentRepository: Repository<ClaimComment>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(UserRole)
        private readonly userRoleRepository: Repository<UserRole>,
        private readonly dataSource: DataSource,
        private readonly emailService: EmailService,
    ) {}
    async create(dto: CreateClaimDto, actorId: string) {
        const actor = await this.getUserOrFail(actorId);
        await this.ensureUserHasRole(actor.id, RoleCode.USER);
        const draftStatus = await this.getStatusOrFail(ClaimStatusCode.DRAFT);
        const claim = this.claimRepository.create({
            claimNumber: this.generateClaimNumber(),
            user: actor,
            title: dto.title,
            description: dto.description ?? null,
            claimAmount: dto.claimAmount.toFixed(2),
            incidentDate: dto.incidentDate,
            currentStatus: draftStatus,
            submittedAt: null,
            reviewedAt: null,
            decidedAt: null,
            reviewedBy: null,
            decidedBy: null,
            rejectionReason: null,
        });
        const savedClaim = await this.claimRepository.save(claim);
        await this.createHistory({
            claim: savedClaim,
            fromStatus: null,
            toStatus: draftStatus,
            actionBy: actor,
            actionRole: RoleCode.USER,
            note: 'Claim created as draft',
        });
        return this.findOneForOwner(savedClaim.id, actor.id);
    }

    async findAll(roleCode: string, actorId: string) {
        const query = this.claimRepository.createQueryBuilder('claim')
            .leftJoinAndSelect('claim.user', 'user')
            .leftJoinAndSelect('claim.currentStatus', 'currentStatus')
            .leftJoinAndSelect('claim.reviewedBy', 'reviewedBy')
            .leftJoinAndSelect('claim.decidedBy', 'decidedBy')
            .where('claim.deletedAt IS NULL')
            .orderBy('claim.createdAt', 'DESC');
        if (roleCode === RoleCode.USER) query.andWhere('user.id = :actorId', { actorId });
        if (roleCode === RoleCode.VERIFIER) query.andWhere('currentStatus.code = :status', { status: ClaimStatusCode.SUBMITTED });
        if (roleCode === RoleCode.APPROVER) query.andWhere('currentStatus.code = :status', {status: ClaimStatusCode.REVIEWED});
        return query.getMany();
    }

    async findOne(id: string) {
        const claim = await this.claimRepository.findOne({
            where: { id },
            relations: [
                'user',
                'currentStatus',
                'reviewedBy',
                'decidedBy',
                'attachments',
                'comments',
                'comments.createdBy',
                'histories',
                'histories.fromStatus',
                'histories.toStatus',
                'histories.actionBy',
            ],
            withDeleted: false,
        });
        if (!claim) throw new NotFoundException('Claim not found');
        return claim;
    }

    async findOneForOwner(id: string, actorId: string) {
        const claim = await this.findOne(id);
        if (claim.user.id !== actorId) throw new ForbiddenException('You can only access your own claim');
        return claim;
    }

    async update(id: string, dto: UpdateClaimDto, actorId: string) {
        const claim = await this.claimRepository.findOne({
            where: { id },
            relations: ['user', 'currentStatus'],
        });

        if (!claim) throw new NotFoundException('Claim not found');
        if (claim.user.id !== actorId) throw new ForbiddenException('You can only update your own claim');
        if (claim.currentStatus.code !== ClaimStatusCode.DRAFT) throw new BadRequestException('Only draft claims can be updated');
        Object.assign(claim, {
            title: dto.title ?? claim.title,
            description: dto.description ?? claim.description,
            claimAmount: dto.claimAmount !== undefined ? dto.claimAmount.toFixed(2) : claim.claimAmount,
            incidentDate: dto.incidentDate ?? claim.incidentDate,
        });
        await this.claimRepository.save(claim);
        return this.findOneForOwner(id, actorId);
    }

    async remove(id: string, actorId: string) {
        const claim = await this.claimRepository.findOne({
            where: { id },
            relations: ['user', 'currentStatus'],
        });
        if (!claim) throw new NotFoundException('Claim not found');
        const actor = await this.userRepository.findOne({
            where: { id: actorId },
            relations: ['userRoles', 'userRoles.role'],
        });
        if (!actor) throw new NotFoundException('Actor not found');

        const isSuperadmin = actor.userRoles?.some(
            (userRole) => userRole.role.code === 'superadmin',
        );
        if (!isSuperadmin) {
            if (claim.user.id !== actorId) throw new ForbiddenException('You can only delete your own claim');
            if (claim.currentStatus.code !== ClaimStatusCode.DRAFT) throw new BadRequestException('Only draft claims can be deleted');
        }
        await this.claimRepository.softRemove(claim);
        return { message: 'Claim deleted successfully' };
    }

    async submit(id: string, actorId: string, dto: SubmitClaimDto) {
        return this.transitionClaim({
            claimId: id,
            actorId,
            expectedRole: RoleCode.USER,
            expectedStatusCode: ClaimStatusCode.DRAFT,
            nextStatusCode: ClaimStatusCode.SUBMITTED,
            note: dto.note ?? 'Claim submitted',
            ownerOnly: true,
        });
    }

    async review(id: string, actorId: string, dto: ReviewClaimDto) {
        return this.transitionClaim({
            claimId: id,
            actorId,
            expectedRole: RoleCode.VERIFIER,
            expectedStatusCode: ClaimStatusCode.SUBMITTED,
            nextStatusCode: ClaimStatusCode.REVIEWED,
            note: dto.note ?? 'Claim reviewed',
        });
    }

    async approve(id: string, actorId: string, dto: DecisionClaimDto) {
        return this.transitionClaim({
            claimId: id,
            actorId,
            expectedRole: RoleCode.APPROVER,
            expectedStatusCode: ClaimStatusCode.REVIEWED,
            nextStatusCode: ClaimStatusCode.APPROVED,
            note: dto.note ?? 'Claim approved',
        });
    }

    async reject(id: string, actorId: string, dto: DecisionClaimDto) {
        if (!dto.rejectionReason) throw new BadRequestException('Rejection reason is required');

        return this.transitionClaim({
            claimId: id,
            actorId,
            expectedRole: RoleCode.APPROVER,
            expectedStatusCode: ClaimStatusCode.REVIEWED,
            nextStatusCode: ClaimStatusCode.REJECTED,
            note: dto.note ?? 'Claim rejected',
            rejectionReason: dto.rejectionReason,
        });
    }

    async addComment(id: string, dto: CreateCommentDto, actorId: string) {
        const actor = await this.getUserOrFail(actorId);
        const claim = await this.findOne(id);
        const comment = this.claimCommentRepository.create({
            claim,
            commentType: dto.commentType,
            commentText: dto.commentText,
            createdBy: actor,
        });
        return this.claimCommentRepository.save(comment);
    }

    // async addAttachment(id: string, dto: CreateAttachmentDto, actorId: string) {
    //     const actor = await this.getUserOrFail(actorId);
    //     const claim = await this.findOne(id);

    //     const attachment = this.claimAttachmentRepository.create({
    //         claim,
    //         fileName: dto.fileName,
    //         fileUrl: dto.fileUrl,
    //         fileMimeType: dto.fileMimeType,
    //         fileSize: dto.fileSize,
    //         uploadedBy: actor,
    //     });

    //     return this.claimAttachmentRepository.save(attachment);
    // }

    async getHistories(id: string) {
        const claim = await this.findOne(id);

        return this.claimStatusHistoryRepository.find({
            where: { claim: { id: claim.id } },
            relations: ['fromStatus', 'toStatus', 'actionBy'],
            order: { createdAt: 'ASC' },
        });
    }

    private async transitionClaim(params: {
        claimId: string
        actorId: string
        expectedRole: RoleCode
        expectedStatusCode: ClaimStatusCode
        nextStatusCode: ClaimStatusCode
        note?: string
        rejectionReason?: string
        ownerOnly?: boolean
    }) {
        const actor = await this.getUserOrFail(params.actorId)
        await this.ensureUserHasRole(actor.id, params.expectedRole)

        return this.dataSource.transaction(async (manager) => {
            const claimRepo = manager.getRepository(Claim)
            const statusRepo = manager.getRepository(ClaimStatus)
            const historyRepo = manager.getRepository(ClaimStatusHistory)

            const claim = await claimRepo.findOne({
                where: { id: params.claimId },
                relations: ['user', 'currentStatus', 'reviewedBy', 'decidedBy'],
                withDeleted: false,
            })

            if (!claim) throw new NotFoundException('Claim not found')

            if (params.ownerOnly && claim.user.id !== params.actorId) throw new ForbiddenException('You can only perform this action on your own claim')

            if (claim.currentStatus.code !== params.expectedStatusCode) throw new BadRequestException(`Invalid transition from ${claim.currentStatus.code} to ${params.nextStatusCode}`,)

            const nextStatus = await statusRepo.findOne({
                where: { code: params.nextStatusCode },
            })

            if (!nextStatus) throw new NotFoundException(`Status ${params.nextStatusCode} not found`)

            const fromStatus = claim.currentStatus
            claim.currentStatus = nextStatus

            if (params.nextStatusCode === ClaimStatusCode.SUBMITTED) claim.submittedAt = new Date()

            if (params.nextStatusCode === ClaimStatusCode.REVIEWED) {
                claim.reviewedAt = new Date()
                claim.reviewedBy = actor
            }

            if ( params.nextStatusCode === ClaimStatusCode.APPROVED || params.nextStatusCode === ClaimStatusCode.REJECTED ) {
                claim.decidedAt = new Date()
                claim.decidedBy = actor
            }

            if (params.nextStatusCode === ClaimStatusCode.REJECTED) claim.rejectionReason = params.rejectionReason ?? null

            const savedClaim = await claimRepo.save(claim)

            const history = historyRepo.create({
                claim: savedClaim,
                fromStatus,
                toStatus: nextStatus,
                actionBy: actor,
                actionRole: params.expectedRole,
                note: params.note ?? null,
            })

            await historyRepo.save(history)

            await this.emailService.sendClaimStatusNotification({
                to: savedClaim.user.email,
                fullName: savedClaim.user.fullName,
                claimNumber: savedClaim.claimNumber,
                status: nextStatus.code,
                note: params.note ?? null,
            })

            return savedClaim
        })
    }   

    private async createHistory(params: {
        claim: Claim;
        fromStatus: ClaimStatus | null;
        toStatus: ClaimStatus;
        actionBy: User;
        actionRole: RoleCode;
        note?: string;
    }) {
        const history = this.claimStatusHistoryRepository.create({
            claim: params.claim,
            fromStatus: params.fromStatus,
            toStatus: params.toStatus,
            actionBy: params.actionBy,
            actionRole: params.actionRole,
            note: params.note ?? null,
        });

        await this.claimStatusHistoryRepository.save(history);
    }

    private async getUserOrFail(id: string) {
        console.log('GET USER OR FAIL ID:', id);
        console.log('USER REPOSITORY TARGET:', this.userRepository.metadata.name);

        if (!id) {
            throw new NotFoundException('Authenticated user id is missing');
        }

        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['userRoles', 'userRoles.role'],
        });

        console.log('USER FOUND:', user);

        if (!user) {
            throw new NotFoundException(`User not found for id: ${id}`);
        }

        return user;
    }

    private async ensureUserHasRole(userId: string, roleCode: RoleCode) {
        const userRole = await this.userRoleRepository.findOne({
        where: {
            user: { id: userId },
            role: { code: roleCode },
        },
            relations: ['user', 'role'],
        });

        if (!userRole) throw new ForbiddenException(`User does not have role ${roleCode}`);
        return userRole;
    }

    private async getStatusOrFail(code: ClaimStatusCode) {
        const status = await this.claimStatusRepository.findOne({ where: { code } });
        if (!status) throw new NotFoundException(`Status ${code} not found`);
        return status;
    }

    private generateClaimNumber(): string {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        const rand = Math.floor(1000 + Math.random() * 9000);

        return `CLM-${y}${m}${d}-${rand}`;
    }
}