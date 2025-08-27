import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../../users/entities/User';
import { Token } from '../../tokens/entities/Token';
import { Page } from '../../pages/entities/Page';
import { Client } from '../../clients/entities/Client';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fb_connect_service',
  entities: [User, Token, Page, Client],
  synchronize: true,
  logging: false,
});

