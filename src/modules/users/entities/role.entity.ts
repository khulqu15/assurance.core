import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { UserRole } from './user-role.entity';

@Entity('roles')
export class Role {
    @PrimaryColumn({ type: 'smallint' })
    id!: number;

    @Column({ unique: true, length: 50 })
    code!: string;

    @Column({ length: 100 })
    name!: string;

    @OneToMany(() => UserRole, (userRole) => userRole.role)
    userRoles!: UserRole[];
}