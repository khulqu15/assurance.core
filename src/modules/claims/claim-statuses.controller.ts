import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { ClaimStatusesService } from './claim-statuses.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleCode } from '../../common/enums/role.enum';
import { SaveClaimStatusDto } from './dto/create-claim-status.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('claim-statuses')
export class ClaimStatusesController {
    constructor(private readonly claimStatusesService: ClaimStatusesService) {}

    @Roles(RoleCode.USER, RoleCode.VERIFIER, RoleCode.APPROVER, RoleCode.SUPERADMIN)
    @Get()
    findAll() {
        return this.claimStatusesService.findAll();
    }

    @Roles(RoleCode.USER, RoleCode.VERIFIER, RoleCode.APPROVER, RoleCode.SUPERADMIN)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.claimStatusesService.findOne(id);
    }

    @Roles(RoleCode.SUPERADMIN)
    @Post()
    create(@Body() dto: SaveClaimStatusDto) {
        return this.claimStatusesService.create(dto);
    }

    @Roles(RoleCode.SUPERADMIN)
    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: SaveClaimStatusDto) {
        return this.claimStatusesService.update(id, dto);
    }

    @Roles(RoleCode.SUPERADMIN)
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.claimStatusesService.remove(id);
    }
}