import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('claim_statuses')
export class ClaimStatus {
    @PrimaryGeneratedColumn({ type: 'smallint' })
    id!: number;

    @Column({ length: 50, unique: true })
    code!: string;

    @Column({ length: 100 })
    name!: string;

    @Column({ type: 'smallint' })
    sequence!: number;
}