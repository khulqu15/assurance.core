import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return api running message', () => {
      expect(appController.getRoot()).toEqual({
        message: 'Insurance Approval API is running',
        status: 'ok',
      });
    });
  });

  describe('health', () => {
    it('should return health status', () => {
      const result = appController.getHealth();

      expect(result.status).toBe('ok');
      expect(result.service).toBe('insurance-approval-api');
      expect(result.timestamp).toBeDefined();
    });
  });
});