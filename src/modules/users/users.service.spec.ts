import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { UserToken } from './entities/user-token.entity';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import { RoleCode } from '../../common/enums/role.enum';
import { createMockRepository } from '../../../test/utils/mock-repository';

jest.mock('bcryptjs', () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

describe('UsersService', () => {
    let service: UsersService;
    let userRepository: ReturnType<typeof createMockRepository>;
    let roleRepository: ReturnType<typeof createMockRepository>;
    let userRoleRepository: ReturnType<typeof createMockRepository>;
    let userTokenRepository: ReturnType<typeof createMockRepository>;
    let jwtService: { signAsync: jest.Mock };
    let emailService: { sendEmailVerification: jest.Mock };

    beforeEach(async () => {
        userRepository = createMockRepository();
        roleRepository = createMockRepository();
        userRoleRepository = createMockRepository();
        userTokenRepository = createMockRepository();
        jwtService = { signAsync: jest.fn() };
        emailService = { sendEmailVerification: jest.fn() };

        const moduleRef = await Test.createTestingModule({
        providers: [
            UsersService,
            { provide: getRepositoryToken(User), useValue: userRepository },
            { provide: getRepositoryToken(Role), useValue: roleRepository },
            { provide: getRepositoryToken(UserRole), useValue: userRoleRepository },
            { provide: getRepositoryToken(UserToken), useValue: userTokenRepository },
            { provide: JwtService, useValue: jwtService },
            { provide: EmailService, useValue: emailService },
        ],
        }).compile();

        service = moduleRef.get(UsersService);
    });

    it('should register user successfully', async () => {
        (userRepository.findOne as jest.Mock<any>).mockResolvedValue(null);
        (bcrypt.hash as jest.Mock<any>).mockResolvedValue('hashed-password');

        const createdUser = {
            fullName: 'Budi',
            email: 'budi@example.com',
            passwordHash: 'hashed-password',
        };

        const savedUser = {
            id: 'user-1',
            fullName: 'Budi',
            email: 'budi@example.com',
            userRoles: [],
        };

        const role = { id: 1, code: RoleCode.USER, name: 'User' };

        userRepository.create.mockReturnValue(createdUser);
        (userRepository.save as jest.Mock<any>).mockResolvedValue(savedUser);
        (roleRepository.findOne as jest.Mock<any>).mockResolvedValue(role);
        userRoleRepository.create.mockReturnValue({ user: savedUser, role });
        (userRoleRepository.save as jest.Mock<any>).mockResolvedValue({ user: savedUser, role });

        jest.spyOn(service, 'sendVerificationEmail').mockResolvedValue({
            message: 'Verification email sent',
        });
        jest.spyOn(service, 'buildAuthResponse').mockResolvedValue({
            accessToken: 'token',
            user: {
                id: 'user-1',
                fullName: 'Budi',
                email: 'budi@example.com',
                roles: [RoleCode.USER],
            },
        });

        const result = await service.register({
            fullName: 'Budi',
            email: 'budi@example.com',
            password: 'password123',
        });

        expect(result.accessToken).toBe('token');
        expect(userRepository.save).toHaveBeenCalled();
        expect(userRoleRepository.save).toHaveBeenCalled();
    });

    it('should throw when email already registered', async () => {
        (userRepository.findOne as jest.Mock<any>).mockResolvedValue({ id: 'existing-user' });

        await expect(
            service.register({
                fullName: 'Budi',
                email: 'budi@example.com',
                password: 'password123',
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it('should login successfully', async () => {
        (userRepository.findOne as jest.Mock<any>).mockResolvedValue({
            id: 'user-1',
            email: 'budi@example.com',
            fullName: 'Budi',
            passwordHash: 'hashed-password',
            isActive: true,
        });

        (bcrypt.compare as jest.Mock<any>).mockResolvedValue(true);

        jest.spyOn(service, 'buildAuthResponse').mockResolvedValue({
            accessToken: 'token',
            user: {
                id: 'user-1',
                fullName: 'Budi',
                email: 'budi@example.com',
                roles: [RoleCode.USER],
            },
        });

        const result = await service.login({
            email: 'budi@example.com',
            password: 'password123',
        });

        expect(result.accessToken).toBe('token');
    });

    it('should throw on invalid login', async () => {
        (userRepository.findOne as jest.Mock<any>).mockResolvedValue({
            id: 'user-1',
            email: 'budi@example.com',
            passwordHash: 'hashed-password',
        });

        (bcrypt.compare as jest.Mock<any>).mockResolvedValue(false);

        await expect(
        service.login({
            email: 'budi@example.com',
            password: 'wrong-password',
        }),).rejects.toThrow(UnauthorizedException);
    });
});