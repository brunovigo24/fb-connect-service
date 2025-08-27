import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Token } from '../../tokens/entities/Token';
import { Page } from '../../pages/entities/Page';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  name?: string;

  @OneToMany(() => Token, token => token.user)
  tokens!: Token[];

  @OneToMany(() => Page, page => page.user)
  pages!: Page[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

