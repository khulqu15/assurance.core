import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { UsersController } from './users.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from './users.service';
import { UsersAdminController } from './user-admin.controller';
import { EmailModule } from '../email/email.module';
import { UserToken } from './user-token.entity';
import { UserSettings } from './entities/user-settings.entity';
import { UserSettingsService } from './user-settings.service';
import { UserSettingsController } from './user-settings.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Role, UserRole, UserToken, UserSettings]),
        JwtModule.register({
            secret: process.env.JWT_SECRET ?? 'supersecretjwtkey',
            signOptions: { expiresIn: '1d' },
        }),
        EmailModule,
    ],
    controllers: [UsersController, UsersAdminController, UserSettingsController],
    providers: [UsersService, JwtStrategy, UserSettingsService],
    exports: [UsersService, TypeOrmModule, JwtModule],
})
export class UsersModule {}