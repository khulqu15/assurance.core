import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { CommentsService } from './comments.service';
import { ClaimComment } from './entities/claim-comment.entity';
import { Claim } from './entities/claim.entity';
import { User } from '../users/entities/user.entity';
import { RoleCode } from '../../common/enums/role.enum';
import { createMockRepository } from '../../../test/utils/mock-repository';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('CommentsService', () => {
  let service: CommentsService;
  let commentRepository: ReturnType<typeof createMockRepository>;
  let claimRepository: ReturnType<typeof createMockRepository>;
  let userRepository: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    commentRepository = createMockRepository();
    claimRepository = createMockRepository();
    userRepository = createMockRepository();

    const moduleRef = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: getRepositoryToken(ClaimComment), useValue: commentRepository },
        { provide: getRepositoryToken(Claim), useValue: claimRepository },
        { provide: getRepositoryToken(User), useValue: userRepository },
      ],
    }).compile();

    service = moduleRef.get(CommentsService);
  });

  it('should create comment', async () => {
    (claimRepository.findOne as jest.Mock<any>).mockResolvedValue({ id: 'claim-1', user: { id: 'user-1' } });
    (userRepository.findOne as jest.Mock<any>).mockResolvedValue({ id: 'user-1' });

    (commentRepository.create as jest.Mock<any>).mockReturnValue({ commentText: 'OK' });
    (commentRepository.save as jest.Mock<any>).mockResolvedValue({ id: 'comment-1' });

    const result = await service.create(
      'claim-1',
      { commentType: 'note', commentText: 'OK' },
      'user-1',
    );

    expect(result).toEqual({ id: 'comment-1' });
  });

  it('should update own comment', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue({
      id: 'comment-1',
      createdBy: { id: 'user-1' },
    } as any);

    (commentRepository.save as jest.Mock<any>).mockResolvedValue({ id: 'comment-1', commentText: 'Updated' });

    const result = await service.update(
      'comment-1',
      { commentType: 'note', commentText: 'Updated' },
      'user-1',
      [RoleCode.USER],
    );

    expect(result.id).toBe('comment-1');
  });

  it('should allow superadmin to update any comment', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue({
      id: 'comment-1',
      createdBy: { id: 'another-user' },
    } as any);

    (commentRepository.save as jest.Mock<any>).mockResolvedValue({ id: 'comment-1' });

    const result = await service.update(
      'comment-1',
      { commentType: 'note', commentText: 'Updated' },
      'superadmin-id',
      [RoleCode.SUPERADMIN],
    );

    expect(result.id).toBe('comment-1');
  });

  it('should reject update by non-owner non-superadmin', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue({
      id: 'comment-1',
      createdBy: { id: 'another-user' },
    } as any);

    await expect(
      service.update(
        'comment-1',
        { commentType: 'note', commentText: 'Updated' },
        'user-1',
        [RoleCode.USER],
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw when comment not found', async () => {
    (commentRepository.findOne as jest.Mock<any>).mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });
});