import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ClaimComment } from './entities/claim-comment.entity';
import { Claim } from './entities/claim.entity';
import { User } from '../users/entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { RoleCode } from '../../common/enums/role.enum';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(ClaimComment)
        private readonly commentRepository: Repository<ClaimComment>,
        @InjectRepository(Claim)
        private readonly claimRepository: Repository<Claim>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async create(claimId: string, dto: CreateCommentDto, actorId: string) {
        const claim = await this.claimRepository.findOne({
            where: { id: claimId },
            relations: ['user'],
        });

        if (!claim) throw new NotFoundException('Claim not found');
        const actor = await this.userRepository.findOne({
            where: { id: actorId },
            relations: ['userRoles', 'userRoles.role'],
        });

        if (!actor) throw new NotFoundException('User not found');

        const comment = this.commentRepository.create({
            claim,
            commentType: dto.commentType,
            commentText: dto.commentText,
            createdBy: actor,
        });
        return this.commentRepository.save(comment);
    }

    async findByClaim(claimId: string) {
        return this.commentRepository.find({
            where: { claim: { id: claimId } },
            relations: ['createdBy'],
            order: { createdAt: 'ASC' },
        });
    }

    async findOne(id: string) {
        const comment = await this.commentRepository.findOne({
            where: { id },
            relations: ['claim', 'createdBy'],
        });

        if (!comment) throw new NotFoundException('Comment not found');
        return comment;
    }

    async update(id: string, dto: CreateCommentDto, actorId: string, roles: string[]) {
        const comment = await this.findOne(id);

        const isSuperadmin = roles.includes(RoleCode.SUPERADMIN);
        const isOwner = comment.createdBy.id === actorId;

        if (!isSuperadmin && !isOwner) throw new ForbiddenException('You can only update your own comment');
        comment.commentType = dto.commentType;
        comment.commentText = dto.commentText;
        return this.commentRepository.save(comment);
    }

    async remove(id: string, actorId: string, roles: string[]) {
        const comment = await this.findOne(id);

        const isSuperadmin = roles.includes(RoleCode.SUPERADMIN);
        const isOwner = comment.createdBy.id === actorId;
        if (!isSuperadmin && !isOwner) throw new ForbiddenException('You can only delete your own comment');

        await this.commentRepository.remove(comment);
        return { message: 'Comment deleted successfully' };
    }
}