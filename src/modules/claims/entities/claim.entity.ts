import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ClaimStatus } from './claim-status.entity';
import { ClaimStatusHistory } from './claim-status-history.entity';
import { ClaimAttachment } from './claim-attachment.entity';
import { ClaimComment } from './claim-comment.entity';

@Entity('claims')
export class Claim {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Index({ unique: true })
    @Column({ name: 'claim_number', length: 50 })
    claimNumber!: string;

    @ManyToOne(() => User, { eager: true, nullable: false, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ length: 200 })
    title!: string;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Column({ name: 'claim_amount', type: 'numeric', precision: 18, scale: 2 })
    claimAmount!: string;

    @Column({ name: 'incident_date', type: 'date' })
    incidentDate!: string;

    @ManyToOne(() => ClaimStatus, { eager: true, nullable: false, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'current_status_id' })
    currentStatus!: ClaimStatus;

    @Column({ name: 'submitted_at', type: 'timestamptz', nullable: true })
    submittedAt?: Date | null;

    @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
    reviewedAt?: Date | null;

    @Column({ name: 'decided_at', type: 'timestamptz', nullable: true })
    decidedAt?: Date | null;

    @ManyToOne(() => User, { eager: true, nullable: true, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'reviewed_by' })
    reviewedBy?: User | null;

    @ManyToOne(() => User, { eager: true, nullable: true, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'decided_by' })
    decidedBy?: User | null;

    @Column({ name: 'rejection_reason', type: 'text', nullable: true })
    rejectionReason?: string | null;

    @VersionColumn({ name: 'version' })
    version!: number;

    @OneToMany(() => ClaimStatusHistory, (history: any) => history.claim)
    histories!: ClaimStatusHistory[];

    @OneToMany(() => ClaimAttachment, (attachment: any) => attachment.claim)
    attachments!: ClaimAttachment[];

    @OneToMany(() => ClaimComment, (comment: any) => comment.claim)
    comments!: ClaimComment[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deletedAt?: Date | null;
}