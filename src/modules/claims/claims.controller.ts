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
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { SubmitClaimDto } from './dto/submit-claim.dto';
import { ReviewClaimDto } from './dto/review-claim.dto';
import { DecisionClaimDto } from './dto/decision-claim.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RoleCode } from '../../common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('claims')
export class ClaimsController {
    constructor(private readonly claimsService: ClaimsService) {}

    @Roles(RoleCode.USER)
    @Post()
    create(
        @Body() dto: CreateClaimDto,
        @CurrentUser() user: { sub: string },
    ) {
        return this.claimsService.create(dto, user.sub);
    }

    @Roles(RoleCode.USER, RoleCode.VERIFIER, RoleCode.APPROVER)
    @Get()
    findAll(@CurrentUser() user: { sub: string; roles: string[] }) {
        const primaryRole = user.roles[0] ?? RoleCode.USER;
        return this.claimsService.findAll(primaryRole, user.sub);
    }

    @Roles(RoleCode.USER, RoleCode.VERIFIER, RoleCode.APPROVER)
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.claimsService.findOne(id);
    }

    @Roles(RoleCode.USER)
    @Put(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateClaimDto,
        @CurrentUser() user: { sub: string },
    ) {
        return this.claimsService.update(id, dto, user.sub);
    }

    @Roles(RoleCode.USER)
    @Delete(':id')
    remove(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
        return this.claimsService.remove(id, user.sub);
    }

    @Roles(RoleCode.USER)
    @Patch(':id/submit')
    submit(
        @Param('id') id: string,
        @Body() dto: SubmitClaimDto,
        @CurrentUser() user: { sub: string },
    ) {
        return this.claimsService.submit(id, user.sub, dto);
    }

    @Roles(RoleCode.VERIFIER)
    @Patch(':id/review')
    review(
        @Param('id') id: string,
        @Body() dto: ReviewClaimDto,
        @CurrentUser() user: { sub: string },
    ) {
        console.log('CURRENT USER FROM TOKEN:', user);
        return this.claimsService.review(id, user.sub, dto);
    }

    @Roles(RoleCode.APPROVER)
    @Patch(':id/approve')
    approve(
        @Param('id') id: string,
        @Body() dto: DecisionClaimDto,
        @CurrentUser() user: { sub: string },
    ) {
        return this.claimsService.approve(id, user.sub, dto);
    }

    @Roles(RoleCode.APPROVER)
    @Patch(':id/reject')
    reject(
        @Param('id') id: string,
        @Body() dto: DecisionClaimDto,
        @CurrentUser() user: { sub: string },
    ) {
        return this.claimsService.reject(id, user.sub, dto);
    }

    @Roles(RoleCode.USER, RoleCode.VERIFIER, RoleCode.APPROVER)
    @Post(':id/comments')
    addComment(
        @Param('id') id: string,
        @Body() dto: CreateCommentDto,
        @CurrentUser() user: { sub: string },
    ) {
        return this.claimsService.addComment(id, dto, user.sub);
    }

    @Roles(RoleCode.USER, RoleCode.VERIFIER, RoleCode.APPROVER)
    @Get(':id/histories')
    getHistories(@Param('id') id: string) {
        return this.claimsService.getHistories(id);
    }
}