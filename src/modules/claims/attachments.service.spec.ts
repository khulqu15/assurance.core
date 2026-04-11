import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AttachmentsService } from './attachments.service';
import { ClaimAttachment } from './entities/claim-attachment.entity';
import { Claim } from './entities/claim.entity';
import { User } from '../users/entities/user.entity';
import { RoleCode } from '../../common/enums/role.enum';
import { createMockRepository } from '../../../test/utils/mock-repository';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('AttachmentsService', () => {
  let service: AttachmentsService;
  let attachmentRepository: ReturnType<typeof createMockRepository>;
  let claimRepository: ReturnType<typeof createMockRepository>;
  let userRepository: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    attachmentRepository = createMockRepository();
    claimRepository = createMockRepository();
    userRepository = createMockRepository();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AttachmentsService,
        { provide: getRepositoryToken(ClaimAttachment), useValue: attachmentRepository },
        { provide: getRepositoryToken(Claim), useValue: claimRepository },
        { provide: getRepositoryToken(User), useValue: userRepository },
      ],
    }).compile();

    service = moduleRef.get(AttachmentsService);
  });

  it('should create attachment from uploaded file', async () => {
    (claimRepository.findOne as jest.Mock<any>).mockResolvedValue({
      id: 'claim-1',
      user: { id: 'user-1' },
    });

    (userRepository.findOne as jest.Mock<any>).mockResolvedValue({
      id: 'user-1',
    });

    const file = {
      originalname: 'document.pdf',
      filename: '1710000000-document.pdf',
      mimetype: 'application/pdf',
      size: 12345,
    } as Express.Multer.File;

    attachmentRepository.create.mockReturnValue({
      originalFileName: 'document.pdf',
      storedFileName: '1710000000-document.pdf',
    });

    (attachmentRepository.save as jest.Mock<any>).mockResolvedValue({
      id: 'attachment-1',
      originalFileName: 'document.pdf',
      storedFileName: '1710000000-document.pdf',
      fileUrl: '/uploads/claims/claim-1/1710000000-document.pdf',
      fileExtension: 'pdf',
      fileMimeType: 'application/pdf',
      fileSize: '12345',
      storageDisk: 'local',
    });

    const result = await service.createFromUpload('claim-1', file, 'user-1');

    expect(claimRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'claim-1' },
      relations: ['user'],
    });

    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'user-1' },
    });

    expect(attachmentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        originalFileName: 'document.pdf',
        storedFileName: '1710000000-document.pdf',
        fileUrl: '/uploads/claims/claim-1/1710000000-document.pdf',
        fileExtension: 'pdf',
        fileMimeType: 'application/pdf',
        fileSize: '12345',
        storageDisk: 'local',
      }),
    );

    expect(result.id).toBe('attachment-1');
  });

  it('should throw when claim not found', async () => {
    (claimRepository.findOne as jest.Mock<any>).mockResolvedValue(null);

    const file = {
      originalname: 'document.pdf',
      filename: '1710000000-document.pdf',
      mimetype: 'application/pdf',
      size: 12345,
    } as Express.Multer.File;

    await expect(
      service.createFromUpload('missing-claim', file, 'user-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should allow owner to remove attachment', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue({
      id: 'attachment-1',
      fileUrl: '/uploads/claims/claim-1/file.pdf',
      uploadedBy: { id: 'user-1' },
    } as any);

    (attachmentRepository.remove as jest.Mock<any>).mockResolvedValue({});

    const result = await service.remove('attachment-1', 'user-1', [RoleCode.USER]);

    expect(result).toEqual({ message: 'Attachment deleted successfully' });
  });

  it('should allow superadmin to remove any attachment', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue({
      id: 'attachment-1',
      fileUrl: '/uploads/claims/claim-1/file.pdf',
      uploadedBy: { id: 'another-user' },
    } as any);

    (attachmentRepository.remove as jest.Mock<any>).mockResolvedValue({});

    const result = await service.remove('attachment-1', 'superadmin-id', [
      RoleCode.SUPERADMIN,
    ]);

    expect(result).toEqual({ message: 'Attachment deleted successfully' });
  });

  it('should reject non-owner non-superadmin', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue({
      id: 'attachment-1',
      fileUrl: '/uploads/claims/claim-1/file.pdf',
      uploadedBy: { id: 'another-user' },
    } as any);

    await expect(
      service.remove('attachment-1', 'user-1', [RoleCode.USER]),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should update metadata for owner', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue({
      id: 'attachment-1',
      originalFileName: 'old.pdf',
      uploadedBy: { id: 'user-1' },
    } as any);

    (attachmentRepository.save as jest.Mock<any>).mockResolvedValue({
      id: 'attachment-1',
      originalFileName: 'new.pdf',
    });

    const result = await service.updateMetadata(
      'attachment-1',
      { originalFileName: 'new.pdf' },
      'user-1',
      [RoleCode.USER],
    );

    expect(result.originalFileName).toBe('new.pdf');
  });
});