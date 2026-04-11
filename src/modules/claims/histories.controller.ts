import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { HistoriesService } from './histories.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleCode } from '../../common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class HistoriesController {
    constructor(private readonly historiesService: HistoriesService) {}

    @Roles(RoleCode.USER, RoleCode.VERIFIER, RoleCode.APPROVER, RoleCode.SUPERADMIN)
    @Get('claims/:claimId/histories')
    findByClaim(@Param('claimId') claimId: string) {
        return this.historiesService.findByClaim(claimId);
    }

    @Roles(RoleCode.USER, RoleCode.VERIFIER, RoleCode.APPROVER, RoleCode.SUPERADMIN)
    @Get('histories/:id')
    findOne(@Param('id') id: string) {
        return this.historiesService.findOne(id);
    }
}