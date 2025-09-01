import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Page } from '../../pages/entities/Page';
import { Client } from '../../clients/entities/Client';

@Entity('webhook_events')
export class WebhookEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Page, { nullable: true, onDelete: 'SET NULL' })
  page?: Page | null;

  @ManyToOne(() => Client, { nullable: true, onDelete: 'SET NULL' })
  client?: Client | null;

  @Column()
  facebookPageId!: string;

  @Column({ nullable: true })
  eventType?: string;

  @Column({ type: 'json' })
  payload!: unknown;

  @CreateDateColumn()
  createdAt!: Date;
}


