import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsOptional, IsString } from 'class-validator';

import { AttachmentsService } from './attachments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RoleCode } from '../../common/enums/role.enum';
import { createAttachmentMulterOptions } from './attachment-upload.config';

class UpdateAttachmentMetadataDto {
  @IsOptional()
  @IsString()
  originalFileName?: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Roles(
    RoleCode.USER,
    RoleCode.VERIFIER,
    RoleCode.APPROVER,
    RoleCode.SUPERADMIN,
  )
  @Post('claims/:claimId/attachments')
  @UseInterceptors(FileInterceptor('file', createAttachmentMulterOptions()))
  create(
    @Param('claimId') claimId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { sub: string },
  ) {
    return this.attachmentsService.createFromUpload(claimId, file, user.sub);
  }

  @Roles(
    RoleCode.USER,
    RoleCode.VERIFIER,
    RoleCode.APPROVER,
    RoleCode.SUPERADMIN,
  )
  @Get('claims/:claimId/attachments')
  findByClaim(@Param('claimId') claimId: string) {
    return this.attachmentsService.findByClaim(claimId);
  }

  @Roles(
    RoleCode.USER,
    RoleCode.VERIFIER,
    RoleCode.APPROVER,
    RoleCode.SUPERADMIN,
  )
  @Get('attachments/:id')
  findOne(@Param('id') id: string) {
    return this.attachmentsService.findOne(id);
  }

  @Roles(
    RoleCode.USER,
    RoleCode.VERIFIER,
    RoleCode.APPROVER,
    RoleCode.SUPERADMIN,
  )
  @Put('attachments/:id')
  updateMetadata(
    @Param('id') id: string,
    @Body() dto: UpdateAttachmentMetadataDto,
    @CurrentUser() user: { sub: string; roles: string[] },
  ) {
    return this.attachmentsService.updateMetadata(id, dto, user.sub, user.roles);
  }

  @Roles(
    RoleCode.USER,
    RoleCode.VERIFIER,
    RoleCode.APPROVER,
    RoleCode.SUPERADMIN,
  )
  @Delete('attachments/:id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; roles: string[] },
  ) {
    return this.attachmentsService.remove(id, user.sub, user.roles);
  }
}