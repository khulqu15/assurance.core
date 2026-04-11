import { Test } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from './users.service';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('JwtStrategy', () => {
    let strategy: JwtStrategy;
    let usersService: { findByIdWithRoles: jest.Mock };

    beforeEach(async () => {
        usersService = {
            findByIdWithRoles: jest.fn(),
        };

        const moduleRef = await Test.createTestingModule({
            providers: [
                JwtStrategy,
                { provide: UsersService, useValue: usersService },
            ],
        }).compile();
        strategy = moduleRef.get(JwtStrategy);
    });

    it('should validate payload and return user object', async () => {
        (usersService.findByIdWithRoles as jest.Mock<any>).mockResolvedValue({
            id: 'user-1',
            email: 'budi@example.com',
            fullName: 'Budi',
            userRoles: [{ role: { code: 'user' } }],
        });

        const result = await strategy.validate({
            sub: 'user-1',
            email: 'budi@example.com',
            roles: ['user'],
        });

        expect(result).toEqual({
            sub: 'user-1',
            email: 'budi@example.com',
            fullName: 'Budi',
            roles: ['user'],
        });
    });
});