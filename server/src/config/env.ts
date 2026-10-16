import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/greengrid?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'greengrid_super_secret_jwt_key_2026_production_grade',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  DEFAULT_CARBON_FACTOR: parseFloat(process.env.DEFAULT_CARBON_FACTOR || '0.82'),
  DEFAULT_TARIFF_RATE: parseFloat(process.env.DEFAULT_TARIFF_RATE || '7.50'),
  DEFAULT_FIXED_CHARGE: parseFloat(process.env.DEFAULT_FIXED_CHARGE || '125.00'),
};
