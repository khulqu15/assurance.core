import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('auth')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.usersService.register(dto);
    }

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.usersService.login(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@CurrentUser() user: { sub: string }) {
        return this.usersService.findByIdWithRoles(user.sub);
    }

    @Post('forgot-password')
        forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.usersService.forgotPassword(dto.email);
    }

    @Post('reset-password')
        resetPassword(@Body() dto: ResetPasswordDto) {
        return this.usersService.resetPassword(dto.token, dto.newPassword);
    }

    @Post('verify-email')
        verifyEmail(@Body() dto: VerifyEmailDto) {
        return this.usersService.verifyEmail(dto.token);
    }

    @UseGuards(JwtAuthGuard)
    @Post('send-verification-email')
        sendVerificationEmail(@CurrentUser() user: { sub: string }) {
        return this.usersService.sendVerificationEmail(user.sub);
    }
}