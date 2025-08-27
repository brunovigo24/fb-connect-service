import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { errorHandler } from './middlewares/errorHandler';
import { requestLogger } from './middlewares/requestLogger';
import authRoutes from './routes/authRoutes';
import postRoutes from './routes/postRoutes';
import protectedRoutes from './routes/protectedRoutes';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan(process.env.LOG_LEVEL || 'dev'));
app.use(requestLogger);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/', protectedRoutes);

app.use(errorHandler);

export default app;

