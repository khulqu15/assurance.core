import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { RoleCode } from '../enums/role.enum';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: jest.Mocked<Reflector>;

    beforeEach(() => {
        reflector = {
            getAllAndOverride: jest.fn(),
        } as unknown as jest.Mocked<Reflector>;

        guard = new RolesGuard(reflector);
    });

    const createContext = (roles?: string[]): ExecutionContext =>({
        switchToHttp: () => ({
            getRequest: () => ({
            user: { roles },
            }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
    }) as unknown as ExecutionContext;

    it('should allow when no required roles', () => {
        reflector.getAllAndOverride.mockReturnValue(undefined);
        expect(guard.canActivate(createContext([RoleCode.USER]))).toBe(true);
    });

    it('should allow superadmin for any protected route', () => {
        reflector.getAllAndOverride.mockReturnValue([RoleCode.APPROVER]);
        expect(guard.canActivate(createContext([RoleCode.SUPERADMIN]))).toBe(true);
    });

    it('should allow matching role', () => {
        reflector.getAllAndOverride.mockReturnValue([RoleCode.USER]);
        expect(guard.canActivate(createContext([RoleCode.USER]))).toBe(true);
    });

    it('should throw when user roles missing', () => {
        reflector.getAllAndOverride.mockReturnValue([RoleCode.USER]);
        expect(() => guard.canActivate(createContext(undefined))).toThrow(
            ForbiddenException,
        );
    });

    it('should throw when role not allowed', () => {
        reflector.getAllAndOverride.mockReturnValue([RoleCode.APPROVER]);
        expect(() => guard.canActivate(createContext([RoleCode.USER]))).toThrow(
            ForbiddenException,
        );
    });
});