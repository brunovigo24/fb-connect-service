import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, Unique } from 'typeorm';
import { User } from '../../users/entities/User';

@Entity('tokens')
@Unique(['user', 'provider'])
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, user => user.tokens, { onDelete: 'CASCADE' })
  user!: User;

  @Column()
  provider!: 'facebook';

  @Column({ type: 'text' })
  accessToken!: string;

  @Column({ type: 'text', nullable: true })
  refreshToken?: string;

  @Column({ type: 'bigint', nullable: true })
  expiresAt?: string; 

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

