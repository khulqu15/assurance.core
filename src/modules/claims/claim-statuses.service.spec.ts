import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ClaimStatusesService } from './claim-statuses.service';
import { ClaimStatus } from './entities/claim-status.entity';
import { createMockRepository } from '../../../test/utils/mock-repository';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('ClaimStatusesService', () => {
  let service: ClaimStatusesService;
  let repository: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    repository = createMockRepository();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ClaimStatusesService,
        { provide: getRepositoryToken(ClaimStatus), useValue: repository },
      ],
    }).compile();

    service = moduleRef.get(ClaimStatusesService);
  });

  it('should return all statuses', async () => {
    (repository.find as jest.Mock<any>).mockResolvedValue([{ code: 'draft' }, { code: 'submitted' }]);
    
    const result = await service.findAll();

    expect(result).toHaveLength(2);
  });

  it('should return one status', async () => {
    (repository.findOne as jest.Mock<any>).mockResolvedValue({ id: 1, code: 'draft' });

    const result = await service.findOne(1);

    expect(result.code).toBe('draft');
  });

  it('should throw when status not found', async () => {
    (repository.findOne as jest.Mock<any>).mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('should create status', async () => {
    (repository.create as jest.Mock<any>).mockReturnValue({ code: 'archived' });
    (repository.save as jest.Mock<any>).mockResolvedValue({ id: 99, code: 'archived' });

    const result = await service.create({
      code: 'archived',
      name: 'Archived',
      sequence: 5,
    });

    expect(result.id).toBe(99);
  });
});