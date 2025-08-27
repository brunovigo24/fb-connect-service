import dotenv from 'dotenv';
import app from './app';
import { AppDataSource } from './shared/database/dataSource';

dotenv.config();

const port = Number(process.env.PORT || 4000);

async function bootstrap(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');
  } catch (err) {
    console.error('Database connection failed', err);
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

bootstrap();

