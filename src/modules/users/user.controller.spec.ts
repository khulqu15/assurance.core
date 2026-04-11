import { Test } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: {
    register: jest.Mock;
    login: jest.Mock;
    findByIdWithRoles: jest.Mock;
    forgotPassword: jest.Mock;
    resetPassword: jest.Mock;
    verifyEmail: jest.Mock;
    sendVerificationEmail: jest.Mock;
  };

  beforeEach(async () => {
    usersService = {
      register: jest.fn(),
      login: jest.fn(),
      findByIdWithRoles: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
      verifyEmail: jest.fn(),
      sendVerificationEmail: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    controller = moduleRef.get(UsersController);
  });

  it('should register user', async () => {
    (usersService.register as jest.Mock<any>).mockResolvedValue({ accessToken: 'token' });

    const result = await controller.register({
      fullName: 'Budi',
      email: 'budi@example.com',
      password: 'password123',
    } as any);

    expect(result).toEqual({ accessToken: 'token' });
    expect(usersService.register).toHaveBeenCalled();
  });

  it('should login user', async () => {
    (usersService.login as jest.Mock<any>).mockResolvedValue({ accessToken: 'token' });

    const result = await controller.login({
      email: 'budi@example.com',
      password: 'password123',
    } as any);

    expect(result).toEqual({ accessToken: 'token' });
  });

  it('should return current user', async () => {
    (usersService.findByIdWithRoles as jest.Mock<any>).mockResolvedValue({ id: 'user-1' });

    const result = await controller.me({ sub: 'user-1' } as any);

    expect(result).toEqual({ id: 'user-1' });
  });
});