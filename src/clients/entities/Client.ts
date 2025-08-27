import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  clientId!: string;

  @Column()
  clientSecret!: string;

  @Column()
  name!: string;

  @Column({ type: 'json', nullable: true })
  scopes?: string[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

