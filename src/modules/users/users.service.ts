import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { RoleCode } from '../../common/enums/role.enum';
import { UserToken } from './user-token.entity';
import { EmailService } from '../email/email.service';
import { randomUUID } from 'crypto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
        @InjectRepository(UserRole)
        private readonly userRoleRepository: Repository<UserRole>,
        private readonly jwtService: JwtService,
        @InjectRepository(UserToken)
        private readonly userTokenRepository: Repository<UserToken>,
        private readonly emailService: EmailService,
    ) {}

    async register(dto: {
        fullName: string;
        email: string;
        password: string;
        role?: string;
        phoneNumber?: string;
        nik?: string;
        birthPlace?: string;
        birthDate?: string;
        address?: string;
        city?: string;
        province?: string;
        postalCode?: string;
    }) {
        const exists = await this.userRepository.findOne({
            where: { email: dto.email.toLowerCase() },
        });
        if (exists) throw new BadRequestException('Email already registered');
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const user = this.userRepository.create({
            fullName: dto.fullName,
            email: dto.email.toLowerCase(),
            passwordHash,
            phoneNumber: dto.phoneNumber ?? null,
            nik: dto.nik ?? null,
            birthPlace: dto.birthPlace ?? null,
            birthDate: dto.birthDate ?? null,
            address: dto.address ?? null,
            city: dto.city ?? null,
            province: dto.province ?? null,
            postalCode: dto.postalCode ?? null,
            isActive: true,
        });

        const savedUser = await this.userRepository.save(user);
        const allowedPublicRoles = [RoleCode.USER, RoleCode.VERIFIER, RoleCode.APPROVER];
        const roleCode =
        dto.role && allowedPublicRoles.includes(dto.role as RoleCode)
            ? dto.role
            : RoleCode.USER;
        const role = await this.roleRepository.findOne({
            where: { code: roleCode },
        });
        if (!role) throw new BadRequestException(`Role ${roleCode} not found`);
        const userRole = this.userRoleRepository.create({
            user: savedUser,
            role,
        });
        await this.sendVerificationEmail(savedUser.id);
        await this.userRoleRepository.save(userRole);
        return this.buildAuthResponse(savedUser.id);
    }

    async login(dto: { email: string; password: string }) {
        const user = await this.userRepository.findOne({
            where: { email: dto.email.toLowerCase() },
            select: ['id', 'email', 'fullName', 'passwordHash', 'isActive'],
        });

        if (!user) throw new UnauthorizedException('Invalid email or password');
        const valid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!valid) throw new UnauthorizedException('Invalid email or password');

        return this.buildAuthResponse(user.id);
    }

    async findByIdWithRoles(userId: string) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['userRoles', 'userRoles.role'],
        });
        if (!user) throw new UnauthorizedException('User not found');

        return user;
    }

    async buildAuthResponse(userId: string) {
        const user = await this.findByIdWithRoles(userId);
        const roles = user.userRoles.map((item) => item.role.code);
        const payload = {
            sub: user.id,
            email: user.email,
            roles,
        };

        const accessToken = await this.jwtService.signAsync(payload);
        return {
            accessToken,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                roles,
            },
        };
    }

    async findAllUsers() {
        return this.userRepository.find({
            relations: ['userRoles', 'userRoles.role'],
            order: { createdAt: 'DESC' },
        });
    }

    async findUserById(id: string) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['userRoles', 'userRoles.role'],
        });

        if (!user) throw new BadRequestException('User not found');
        return user;
    }

    async updateUser(
        id: string,
        dto: {
            fullName?: string;
            email?: string;
            isActive?: boolean;
            phoneNumber?: string;
            nik?: string;
            birthPlace?: string;
            birthDate?: string;
            address?: string;
            city?: string;
            province?: string;
            postalCode?: string;
        },
    ) {
        const user = await this.findUserById(id);

        if (dto.fullName !== undefined) user.fullName = dto.fullName;
        if (dto.email !== undefined) user.email = dto.email.toLowerCase();
        if (dto.isActive !== undefined) user.isActive = dto.isActive;
        if (dto.phoneNumber !== undefined) user.phoneNumber = dto.phoneNumber;
        if (dto.nik !== undefined) user.nik = dto.nik;
        if (dto.birthPlace !== undefined) user.birthPlace = dto.birthPlace;
        if (dto.birthDate !== undefined) user.birthDate = dto.birthDate;
        if (dto.address !== undefined) user.address = dto.address;
        if (dto.city !== undefined) user.city = dto.city;
        if (dto.province !== undefined) user.province = dto.province;
        if (dto.postalCode !== undefined) user.postalCode = dto.postalCode;

        return this.userRepository.save(user);
    }

    async updateUserRole(id: string, roleCode: string) {
        const user = await this.findUserById(id);
        const role = await this.roleRepository.findOne({ where: { code: roleCode } });

        if (!role) throw new BadRequestException(`Role ${roleCode} not found`);

        await this.userRoleRepository.delete({ user: { id: user.id } as any });
        await this.userRoleRepository.save(
            this.userRoleRepository.create({
                user,
                role,
            }),
        );

        return this.findUserById(id);
    }

    async updatePassword(id: string, password: string) {
        const user = await this.userRepository.findOne({
            where: { id },
            select: ['id', 'passwordHash'],
        });

        if (!user) throw new BadRequestException('User not found');

        user.passwordHash = await bcrypt.hash(password, 10);
        await this.userRepository.save(user);

        return { message: 'Password updated successfully' };
    }

    async deactivateUser(id: string) {
        const user = await this.findUserById(id);
        user.isActive = false;
        await this.userRepository.save(user);
        return { message: 'User deactivated successfully' };
    }

    async sendVerificationEmail(userId: string) {
        const user = await this.findByIdWithRoles(userId);
        if (user.emailVerifiedAt) return { message: 'Email already verified' };

        const token = randomUUID();
        const entity = this.userTokenRepository.create({
            user,
            type: 'email_verification',
            token,
            isUsed: false,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        });
        await this.userTokenRepository.save(entity);
        const verificationUrl = `${process.env.APP_BASE_URL}/verify-email?token=${token}`;
        await this.emailService.sendEmailVerification(
            user.email,
            user.fullName,
            verificationUrl,
        );

        return { message: 'Verification email sent' };
    }

        async verifyEmail(token: string) {
        const record = await this.userTokenRepository.findOne({
            where: {
                token,
                type: 'email_verification',
                isUsed: false,
            },
            relations: ['user'],
        });

        if (!record) throw new UnauthorizedException('Invalid verification token');
        if (record.expiresAt.getTime() < Date.now()) throw new UnauthorizedException('Verification token has expired');
        record.isUsed = true;
        record.user.emailVerifiedAt = new Date();

        await this.userRepository.save(record.user);
        await this.userTokenRepository.save(record);

        return { message: 'Email verified successfully' };
    }

    async forgotPassword(email: string) {
        const user = await this.userRepository.findOne({
            where: { email: email.toLowerCase() },
        });

        if (!user) return { message: 'If the email exists, a reset link has been sent' };
        const token = randomUUID();
        const entity = this.userTokenRepository.create({
            user,
            type: 'reset_password',
            token,
            isUsed: false,
            expiresAt: new Date(Date.now() + 1000 * 60 * 30),
        });

        await this.userTokenRepository.save(entity);
        const resetUrl = `${process.env.APP_BASE_URL}/reset-password?token=${token}`;
        await this.emailService.sendResetPassword(
            user.email,
            user.fullName,
            resetUrl,
        );
        return { message: 'If the email exists, a reset link has been sent' };
    }

    async resetPassword(token: string, newPassword: string) {
        const record = await this.userTokenRepository.findOne({
            where: {
                token,
                type: 'reset_password',
                isUsed: false,
            },
            relations: ['user'],
        });

        if (!record) throw new UnauthorizedException('Invalid reset token');
        if (record.expiresAt.getTime() < Date.now()) throw new UnauthorizedException('Reset token has expired');

        record.user.passwordHash = await bcrypt.hash(newPassword, 10);
        record.isUsed = true;

        await this.userRepository.save(record.user);
        await this.userTokenRepository.save(record);

        return { message: 'Password reset successfully' };
    }

    async broadcastSystemUpdate(title: string, content: string) {
        const users = await this.userRepository.find({
            where: { isActive: true },
        });
        for (const user of users) {
            await this.emailService.sendSystemUpdate({
                to: user.email,
                fullName: user.fullName,
                title,
                content,
            });
        }
        return { message: `System update sent to ${users.length} users` };
    }
}