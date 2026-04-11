import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { ClaimsService } from './claims.service';
import { Claim } from './entities/claim.entity';
import { ClaimStatus } from './entities/claim-status.entity';
import { ClaimStatusHistory } from './entities/claim-status-history.entity';
import { ClaimAttachment } from './entities/claim-attachment.entity';
import { ClaimComment } from './entities/claim-comment.entity';
import { IdempotencyKey } from './entities/idempotency-key.entity';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { UserRole } from '../users/entities/user-role.entity';
import { EmailService } from '../email/email.service';

import { RoleCode } from '../../common/enums/role.enum';
import { ClaimStatusCode } from '../../common/enums/claim-status.enum';
import { createMockRepository } from '../../../test/utils/mock-repository';

describe('ClaimsService', () => {
  let service: ClaimsService;

  let claimRepository: ReturnType<typeof createMockRepository>;
  let claimStatusRepository: ReturnType<typeof createMockRepository>;
  let claimStatusHistoryRepository: ReturnType<typeof createMockRepository>;
  let claimAttachmentRepository: ReturnType<typeof createMockRepository>;
  let claimCommentRepository: ReturnType<typeof createMockRepository>;
  let idempotencyRepository: ReturnType<typeof createMockRepository>;
  let userRepository: ReturnType<typeof createMockRepository>;
  let roleRepository: ReturnType<typeof createMockRepository>;
  let userRoleRepository: ReturnType<typeof createMockRepository>;
  let emailService: { sendClaimStatusNotification: jest.Mock };

  const transactionMock = jest.fn();

  beforeEach(async () => {
    claimRepository = createMockRepository();
    claimStatusRepository = createMockRepository();
    claimStatusHistoryRepository = createMockRepository();
    claimAttachmentRepository = createMockRepository();
    claimCommentRepository = createMockRepository();
    idempotencyRepository = createMockRepository();
    userRepository = createMockRepository();
    roleRepository = createMockRepository();
    userRoleRepository = createMockRepository();
    emailService = { sendClaimStatusNotification: jest.fn() };

    const dataSourceMock = {
      transaction: transactionMock,
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ClaimsService,
        { provide: getRepositoryToken(Claim), useValue: claimRepository },
        { provide: getRepositoryToken(ClaimStatus), useValue: claimStatusRepository },
        { provide: getRepositoryToken(ClaimStatusHistory), useValue: claimStatusHistoryRepository },
        { provide: getRepositoryToken(ClaimAttachment), useValue: claimAttachmentRepository },
        { provide: getRepositoryToken(ClaimComment), useValue: claimCommentRepository },
        { provide: getRepositoryToken(IdempotencyKey), useValue: idempotencyRepository },
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(Role), useValue: roleRepository },
        { provide: getRepositoryToken(UserRole), useValue: userRoleRepository },
        { provide: DataSource, useValue: dataSourceMock },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    service = moduleRef.get(ClaimsService);
  });

  it('should create claim successfully', async () => {
    const actor = {
        id: 'user-1',
        fullName: 'Budi',
        email: 'budi@example.com',
    };

    const draftStatus = {
        id: 1,
        code: ClaimStatusCode.DRAFT,
        name: 'Draft',
        sequence: 1,
    };

    const createdClaim = {
        claimNumber: 'CLM-20260412-1234',
        user: actor,
        title: 'Claim A',
        description: 'Desc',
        claimAmount: '100000.00',
        incidentDate: '2026-04-01',
        currentStatus: draftStatus,
    };

    const savedClaim = {
        id: 'claim-1',
        ...createdClaim,
    };

    jest.spyOn<any, any>(service as any, 'getUserOrFail').mockResolvedValue(actor);
    jest
        .spyOn<any, any>(service as any, 'ensureUserHasRole')
        .mockResolvedValue({ user: actor, role: { code: RoleCode.USER } });
    jest.spyOn<any, any>(service as any, 'getStatusOrFail').mockResolvedValue(draftStatus);
    jest.spyOn(service, 'findOneForOwner').mockResolvedValue(savedClaim as any);

    (claimRepository.create as jest.Mock).mockReturnValue(createdClaim);
    (claimRepository.save as jest.Mock).mockResolvedValue(savedClaim);
    (claimStatusHistoryRepository.create as jest.Mock).mockReturnValue({
        claim: savedClaim,
    });
    (claimStatusHistoryRepository.save as jest.Mock).mockResolvedValue({
        id: 'history-1',
    });

    const result = await service.create(
        {
        title: 'Claim A',
        description: 'Desc',
        claimAmount: 100000,
        incidentDate: '2026-04-01',
        },
        'user-1',
    );

    expect(claimRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
        user: actor,
        title: 'Claim A',
        description: 'Desc',
        claimAmount: '100000.00',
        incidentDate: '2026-04-01',
        currentStatus: draftStatus,
        }),
    );

    expect(claimRepository.save).toHaveBeenCalled();
    expect(claimStatusHistoryRepository.save).toHaveBeenCalled();
    expect(result).toEqual(savedClaim);
    });

  it('should reject update when claim is not draft', async () => {
    (claimRepository.findOne as jest.Mock<any>).mockResolvedValue({
      id: 'claim-1',
      user: { id: 'user-1' },
      currentStatus: { code: ClaimStatusCode.SUBMITTED },
    });

    await expect(
      service.update('claim-1', { title: 'Updated' }, 'user-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject update by non-owner', async () => {
    (claimRepository.findOne as jest.Mock<any>).mockResolvedValue({
      id: 'claim-1',
      user: { id: 'another-user' },
      currentStatus: { code: ClaimStatusCode.DRAFT },
    });

    await expect(
      service.update('claim-1', { title: 'Updated' }, 'user-1'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw when claim not found', async () => {
    (claimRepository.findOne as jest.Mock<any>).mockResolvedValue(null);

    await expect(service.update('missing-id', {}, 'user-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should return findOneForOwner when owner matches', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue({
      id: 'claim-1',
      user: { id: 'user-1' },
    } as any);

    const result = await service.findOneForOwner('claim-1', 'user-1');
    expect(result.id).toBe('claim-1');
  });

  it('should reject findOneForOwner when not owner', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue({
      id: 'claim-1',
      user: { id: 'another-user' },
    } as any);

    await expect(service.findOneForOwner('claim-1', 'user-1')).rejects.toThrow(
      ForbiddenException,
    );
  });
});