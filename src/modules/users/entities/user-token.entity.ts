import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

export type UserTokenType = 'email_verification' | 'reset_password';

@Entity('user_tokens')
export class UserToken {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({
        type: 'varchar',
        length: 50,
    })
    type!: UserTokenType;

    @Column({
        type: 'text',
        unique: true,
    })
    token!: string;

    @Column({
        name: 'is_used',
        type: 'boolean',
        default: false,
    })
    isUsed!: boolean;

    @Column({
        name: 'expires_at',
        type: 'datetime',
    })
    expiresAt!: Date;

    @CreateDateColumn({
        name: 'created_at',
        type: 'datetime',
    })
    createdAt!: Date;
}