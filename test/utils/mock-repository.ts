import { jest } from '@jest/globals';

export interface MockRepository {
  find: jest.Mock;
  findOne: jest.Mock;
  findOneBy: jest.Mock;
  findOneByOrFail: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  remove: jest.Mock;
  delete: jest.Mock;
  softRemove: jest.Mock;
  createQueryBuilder: jest.Mock;
}

export const createMockRepository = (): MockRepository => ({
  find: jest.fn() as jest.Mock,
  findOne: jest.fn() as jest.Mock,
  findOneBy: jest.fn() as jest.Mock,
  findOneByOrFail: jest.fn() as jest.Mock,
  create: jest.fn() as jest.Mock,
  save: jest.fn() as jest.Mock,
  remove: jest.fn() as jest.Mock,
  delete: jest.fn() as jest.Mock,
  softRemove: jest.fn() as jest.Mock,
  createQueryBuilder: jest.fn() as jest.Mock,
});