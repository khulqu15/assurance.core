import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { Repository } from 'typeorm';

import { ClaimAttachment } from './entities/claim-attachment.entity';
import { Claim } from './entities/claim.entity';
import { User } from '../users/entities/user.entity';
import { RoleCode } from '../../common/enums/role.enum';
import { validateAttachmentFile } from './attachment-upload.helper';

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectRepository(ClaimAttachment)
    private readonly attachmentRepository: Repository<ClaimAttachment>,
    @InjectRepository(Claim)
    private readonly claimRepository: Repository<Claim>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createFromUpload(
    claimId: string,
    file: Express.Multer.File,
    actorId: string,
  ) {
    const claim = await this.claimRepository.findOne({
      where: { id: claimId },
      relations: ['user'],
    });

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    const actor = await this.userRepository.findOne({
      where: { id: actorId },
    });

    if (!actor) {
      throw new NotFoundException('User not found');
    }

    const extension = validateAttachmentFile(file);
    const relativeUrl = `/uploads/claims/${claimId}/${file.filename}`;

    const attachment = this.attachmentRepository.create({
      claim,
      originalFileName: file.originalname,
      storedFileName: file.filename,
      fileUrl: relativeUrl,
      fileExtension: extension.replace('.', ''),
      fileMimeType: file.mimetype,
      fileSize: String(file.size),
      storageDisk: 'local',
      uploadedBy: actor,
    });

    return this.attachmentRepository.save(attachment);
  }

  async findByClaim(claimId: string) {
    return this.attachmentRepository.find({
      where: { claim: { id: claimId } },
      relations: ['uploadedBy'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string) {
    const attachment = await this.attachmentRepository.findOne({
      where: { id },
      relations: ['claim', 'uploadedBy'],
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    return attachment;
  }

  async updateMetadata(
    id: string,
    dto: { originalFileName?: string },
    actorId: string,
    roles: string[],
  ) {
    const attachment = await this.findOne(id);

    const isSuperadmin = roles.includes(RoleCode.SUPERADMIN);
    const isOwner = attachment.uploadedBy.id === actorId;

    if (!isSuperadmin && !isOwner) {
      throw new ForbiddenException('You can only update your own attachment');
    }

    if (dto.originalFileName !== undefined) {
      attachment.originalFileName = dto.originalFileName;
    }

    return this.attachmentRepository.save(attachment);
  }

  async remove(id: string, actorId: string, roles: string[]) {
    const attachment = await this.findOne(id);

    const isSuperadmin = roles.includes(RoleCode.SUPERADMIN);
    const isOwner = attachment.uploadedBy.id === actorId;

    if (!isSuperadmin && !isOwner) {
      throw new ForbiddenException('You can only delete your own attachment');
    }

    const filePath = join(process.cwd(), attachment.fileUrl.replace(/^\//, ''));

    if (existsSync(filePath)) {
      await unlink(filePath);
    }

    await this.attachmentRepository.remove(attachment);

    return { message: 'Attachment deleted successfully' };
  }
}