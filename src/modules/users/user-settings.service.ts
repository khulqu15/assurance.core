import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { UserSettings } from './entities/user-settings.entity';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';

@Injectable()
export class UserSettingsService {
  constructor(
    @InjectRepository(UserSettings)
    private readonly userSettingsRepository: Repository<UserSettings>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getMySettings(userId: string) {
    const settings = await this.userSettingsRepository.findOne({
      where: { user: { id: userId } },
    });

    if (settings) {
      return settings;
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const created = this.userSettingsRepository.create({
      user,
      emailNotification: true,
      pushNotification: false,
      claimStatusNotification: true,
      approvalDecisionNotification: true,
      weeklySummary: true,
      theme: 'light',
      language: 'en',
      defaultPage: 'dashboard',
      rowsPerPage: 25,
      rememberSession: true,
      twoFactorAuth: false,
      loginAlert: true,
      autoLogout: true,
    });

    return this.userSettingsRepository.save(created);
  }

  async updateMySettings(userId: string, dto: UpdateUserSettingsDto) {
    const settings = await this.getMySettings(userId);

    Object.assign(settings, dto);

    return this.userSettingsRepository.save(settings);
  }
}