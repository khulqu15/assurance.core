import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export type ThemeMode = 'light' | 'dark' | 'system';
export type LanguageMode = 'en' | 'id' | 'jp';
export type DefaultPageMode =
  | 'dashboard'
  | 'claims'
  | 'activity-log'
  | 'profile'
  | 'settings';

@Entity('user_settings')
export class UserSettings {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'email_notification', type: 'boolean', default: true })
  emailNotification!: boolean;

  @Column({ name: 'push_notification', type: 'boolean', default: false })
  pushNotification!: boolean;

  @Column({ name: 'claim_status_notification', type: 'boolean', default: true })
  claimStatusNotification!: boolean;

  @Column({ name: 'approval_decision_notification', type: 'boolean', default: true })
  approvalDecisionNotification!: boolean;

  @Column({ name: 'weekly_summary', type: 'boolean', default: true })
  weeklySummary!: boolean;

  @Column({ type: 'varchar', length: 20, default: 'light' })
  theme!: ThemeMode;

  @Column({ type: 'varchar', length: 10, default: 'en' })
  language!: LanguageMode;

  @Column({ name: 'default_page', type: 'varchar', length: 30, default: 'dashboard' })
  defaultPage!: DefaultPageMode;

  @Column({ name: 'rows_per_page', type: 'int', default: 25 })
  rowsPerPage!: number;

  @Column({ name: 'remember_session', type: 'boolean', default: true })
  rememberSession!: boolean;

  @Column({ name: 'two_factor_auth', type: 'boolean', default: false })
  twoFactorAuth!: boolean;

  @Column({ name: 'login_alert', type: 'boolean', default: true })
  loginAlert!: boolean;

  @Column({ name: 'auto_logout', type: 'boolean', default: true })
  autoLogout!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt!: Date;
}