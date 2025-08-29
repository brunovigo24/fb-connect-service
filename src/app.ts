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
import webhookRoutes from './routes/webhookRoutes';
import swaggerUi from 'swagger-ui-express';
import openapiSpec from './docs/openapi.json';
import protectedRoutes from './routes/protectedRoutes';

dotenv.config();

const app = express();

// Montar body para verificação de assinatura de webhooks ANTES do analisador JSON
app.use('/webhooks/facebook', express.raw({ type: '*/*' }));

// anexar body bruto à solicitação para verificação posterior
app.use((req, _res, next) => {
  const anyReq = req as any;
  if (anyReq.body && Buffer.isBuffer(anyReq.body)) {
    anyReq.rawBody = anyReq.body;
  }
  next();
});
app.use(express.json({ limit: '1mb' }));
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
app.use('/webhooks', webhookRoutes);

// Docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
app.get('/docs-json', (_req, res) => res.json(openapiSpec));
app.use('/', protectedRoutes);

app.use(errorHandler);

export default app;

