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

@Entity('claim_attachments')
export class ClaimAttachment {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Claim, (claim) => claim.attachments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'claim_id' })
    claim!: Claim;

    @Column({
        name: 'original_file_name',
        type: 'varchar',
        length: 255,
    })
    originalFileName!: string;

    @Column({
        name: 'stored_file_name',
        type: 'varchar',
        length: 255,
    })
    storedFileName!: string;

    @Column({
        name: 'file_url',
        type: 'text',
    })
    fileUrl!: string;

    @Column({
        name: 'file_extension',
        type: 'varchar',
        length: 20,
    })
    fileExtension!: string;

    @Column({
        name: 'file_mime_type',
        type: 'varchar',
        length: 100,
    })
    fileMimeType!: string;

    @Column({
        name: 'file_size',
        type: 'bigint',
    })
    fileSize!: string;

    @Column({
        name: 'storage_disk',
        type: 'varchar',
        length: 50,
        default: 'local',
    })
    storageDisk!: string;

    @ManyToOne(() => User, { eager: true, nullable: false, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'uploaded_by' })
    uploadedBy!: User;

    @CreateDateColumn({
        name: 'created_at',
        type: 'timestamptz',
    })
    createdAt!: Date;
}