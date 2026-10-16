import app from './app';
import { ENV } from './config/env';
import prisma from './config/prisma';

const server = app.listen(ENV.PORT, async () => {
  console.log('==================================================');
  console.log(`🌿 Green Grid Server is running on port ${ENV.PORT}`);
  console.log(`📡 API Base URL: http://localhost:${ENV.PORT}/api`);
  console.log(`📚 Swagger UI Docs: http://localhost:${ENV.PORT}/api/docs`);
  console.log(`🌐 Client Allowed Origin: ${ENV.CLIENT_URL}`);

  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log(`🗄️ Database: PostgreSQL connected successfully on port 5432`);
  } catch (err: any) {
    console.warn(`⚠️ Database connection pending or offline: ${err.message}`);
  }
  console.log('==================================================');
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received. Closing HTTP server...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
