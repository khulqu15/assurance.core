import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class UpdateUserSettingsDto {
  @IsOptional()
  @IsBoolean()
  emailNotification?: boolean;

  @IsOptional()
  @IsBoolean()
  pushNotification?: boolean;

  @IsOptional()
  @IsBoolean()
  claimStatusNotification?: boolean;

  @IsOptional()
  @IsBoolean()
  approvalDecisionNotification?: boolean;

  @IsOptional()
  @IsBoolean()
  weeklySummary?: boolean;

  @IsOptional()
  @IsIn(['light', 'dark', 'system'])
  theme?: 'light' | 'dark' | 'system';

  @IsOptional()
  @IsIn(['en', 'id', 'jp'])
  language?: 'en' | 'id' | 'jp';

  @IsOptional()
  @IsIn(['dashboard', 'claims', 'activity-log', 'profile', 'settings'])
  defaultPage?: 'dashboard' | 'claims' | 'activity-log' | 'profile' | 'settings';

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(100)
  rowsPerPage?: number;

  @IsOptional()
  @IsBoolean()
  rememberSession?: boolean;

  @IsOptional()
  @IsBoolean()
  twoFactorAuth?: boolean;

  @IsOptional()
  @IsBoolean()
  loginAlert?: boolean;

  @IsOptional()
  @IsBoolean()
  autoLogout?: boolean;
}