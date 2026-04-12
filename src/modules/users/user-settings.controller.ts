import {
  Body,
  Controller,
  Get,
  Put,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
import { UserSettingsService } from './user-settings.service';

@UseGuards(JwtAuthGuard)
@Controller('settings')
export class UserSettingsController {
    constructor(
        private readonly userSettingsService: UserSettingsService,
    ) {}

    @Get()
    getMySettings(@CurrentUser() user: { sub: string }) {
        return this.userSettingsService.getMySettings(user.sub);
    }

    @Put()
    updateMySettings(
        @CurrentUser() user: { sub: string },
        @Body() dto: UpdateUserSettingsDto,
    ) {
        return this.userSettingsService.updateMySettings(user.sub, dto);
    }
}