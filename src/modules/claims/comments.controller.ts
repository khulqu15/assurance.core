import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RoleCode } from '../../common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {}

    @Roles(RoleCode.USER, RoleCode.VERIFIER, RoleCode.APPROVER, RoleCode.SUPERADMIN)
    @Post('claims/:claimId/comments')
    create(
        @Param('claimId') claimId: string,
        @Body() dto: CreateCommentDto,
        @CurrentUser() user: { sub: string },
    ) {
        return this.commentsService.create(claimId, dto, user.sub);
    }

    @Roles(RoleCode.USER, RoleCode.VERIFIER, RoleCode.APPROVER, RoleCode.SUPERADMIN)
    @Get('claims/:claimId/comments')
    findByClaim(@Param('claimId') claimId: string) {
        return this.commentsService.findByClaim(claimId);
    }

    @Roles(RoleCode.USER, RoleCode.VERIFIER, RoleCode.APPROVER, RoleCode.SUPERADMIN)
    @Get('comments/:id')
    findOne(@Param('id') id: string) {
        return this.commentsService.findOne(id);
    }

    @Roles(RoleCode.USER, RoleCode.VERIFIER, RoleCode.APPROVER, RoleCode.SUPERADMIN)
    @Put('comments/:id')
    update(
        @Param('id') id: string,
        @Body() dto: CreateCommentDto,
        @CurrentUser() user: { sub: string; roles: string[] },
    ) {
        return this.commentsService.update(id, dto, user.sub, user.roles);
    }

    @Roles(RoleCode.USER, RoleCode.VERIFIER, RoleCode.APPROVER, RoleCode.SUPERADMIN)
    @Delete('comments/:id')
    remove(
        @Param('id') id: string,
        @CurrentUser() user: { sub: string; roles: string[] },
    ) {
        return this.commentsService.remove(id, user.sub, user.roles);
    }
}