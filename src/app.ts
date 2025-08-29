import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { errorHandler } from './middlewares/errorHandler';
import { requestLogger } from './middlewares/requestLogger';
import { requestId } from './middlewares/requestId';
import authRoutes from './routes/authRoutes';
import postRoutes from './routes/postRoutes';
import protectedRoutes from './routes/protectedRoutes';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
const morganLib = morgan as any;
morganLib.token('id', (req: any) => req.requestId || '-');
morganLib.token('clientId', (req: any) => req.client?.clientId || '-');
morganLib.token('clientName', (req: any) => req.client?.name || '-');
app.use(requestId);
app.use(morgan(':method :url :status - :response-time ms [id=:id] [client=:clientId::clientName]'));
app.use(requestLogger);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/', protectedRoutes);

app.use(errorHandler);

export default app;

