import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from './user-role.entity';
import { UserSettings } from './user-settings.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'full_name',
    type: 'varchar',
    length: 150,
  })
  fullName!: string;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    unique: true,
  })
  email!: string;

  @Column({
    name: 'password_hash',
    type: 'text',
    select: false,
  })
  passwordHash!: string;

  @Column({
    name: 'phone_number',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  phoneNumber?: string | null;

  @Column({
    name: 'nik',
    type: 'varchar',
    length: 30,
    unique: true,
    nullable: true,
  })
  nik?: string | null;

  @Column({
    name: 'birth_place',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  birthPlace?: string | null;

  @Column({
    name: 'birth_date',
    type: 'date',
    nullable: true,
  })
  birthDate?: string | null;

  @Column({
    name: 'address',
    type: 'text',
    nullable: true,
  })
  address?: string | null;

  @Column({
    name: 'city',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  city?: string | null;

  @Column({
    name: 'province',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  province?: string | null;

  @Column({
    name: 'postal_code',
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  postalCode?: string | null;

  @Column({
    name: 'email_verified_at',
    type: 'datetime',
    nullable: true,
  })
  emailVerifiedAt?: Date | null;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles!: UserRole[];

  @CreateDateColumn({
    name: 'created_at',
    type: 'datetime',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'datetime',
  })
  updatedAt!: Date;

  @OneToOne(() => UserSettings, (settings) => settings.user)
  settings!: UserSettings;
}