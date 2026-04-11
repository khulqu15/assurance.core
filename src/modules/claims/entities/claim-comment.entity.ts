import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Claim } from './claim.entity';
import { User } from '../../users/entities/user.entity';

@Entity('claim_comments')
export class ClaimComment {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Claim, (claim) => claim.comments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'claim_id' })
    claim!: Claim;

    @Column({ name: 'comment_type', length: 30 })
    commentType!: string;

    @Column({ name: 'comment_text', type: 'text' })
    commentText!: string;

    @ManyToOne(() => User, { eager: true, nullable: false, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'created_by' })
    createdBy!: User;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}