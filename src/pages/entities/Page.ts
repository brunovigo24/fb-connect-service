import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/User';

@Entity('pages')
export class Page {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, user => user.pages, { onDelete: 'CASCADE' })
  user!: User;

  @Column()
  pageId!: string; // Facebook Page ID

  @Column({ nullable: true })
  pageName?: string;

  @Column({ type: 'text', nullable: true })
  pageAccessToken?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

