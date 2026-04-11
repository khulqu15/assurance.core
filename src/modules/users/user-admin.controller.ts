import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleCode } from '../../common/enums/role.enum';
import { UsersService } from './users.service';
import { CreateUserByAdminDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { BroadcastSystemUpdateDto } from './dto/broadcast-system-update.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleCode.SUPERADMIN)
@Controller('users')
export class UsersAdminController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    create(@Body() dto: CreateUserByAdminDto) {
        return this.usersService.register(dto);
    }

    @Get()
    findAll() {
        return this.usersService.findAllUsers();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findUserById(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
        return this.usersService.updateUser(id, dto);
    }

    @Patch(':id/role')
    updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
        return this.usersService.updateUserRole(id, dto.role);
    }

    @Patch(':id/password')
    updatePassword(@Param('id') id: string, @Body() dto: UpdatePasswordDto) {
        return this.usersService.updatePassword(id, dto.password);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.deactivateUser(id);
    }

    @Post('broadcast-system-update')
    broadcastSystemUpdate(@Body() dto: BroadcastSystemUpdateDto) {
        return this.usersService.broadcastSystemUpdate(dto.title, dto.content);
    }
}