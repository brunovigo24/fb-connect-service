import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('data_deletion_requests')
export class DataDeletionRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userIdentifier!: string; // facebookId or userId

  @Column({ type: 'json', nullable: true })
  details?: unknown;

  @CreateDateColumn()
  createdAt!: Date;
}



