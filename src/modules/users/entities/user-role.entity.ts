import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Role } from './role.entity';

@Entity('user_roles')
@Unique('uq_user_roles_user_role', ['user', 'role'])
export class UserRole {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, (user) => user.userRoles, { onDelete: 'CASCADE', eager: true })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @ManyToOne(() => Role, (role) => role.userRoles, { onDelete: 'RESTRICT', eager: true })
    @JoinColumn({ name: 'role_id' })
    role!: Role;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}