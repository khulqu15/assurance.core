import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './entities/user.entity';

export type UserTokenType = 'email_verification' | 'reset_password';

@Entity('user_tokens')
export class UserToken {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ length: 50 })
    type!: UserTokenType;

    @Column({ type: 'text', unique: true })
    token!: string;

    @Column({ name: 'is_used', default: false })
    isUsed!: boolean;

    @Column({ name: 'expires_at', type: 'datetime' })
    expiresAt!: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}