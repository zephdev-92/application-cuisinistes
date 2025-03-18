import dotenv from 'dotenv';
import { Secret, SignOptions } from 'jsonwebtoken';

// Charger les variables d'environnement
dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  mongoURI: string;
  jwtSecret: Secret;
  jwtExpire: SignOptions['expiresIn'];
  corsOrigin: string;
}

const config: Config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoURI: process.env.DATABASE_URL || 'mongodb://localhost:27017/cuisine-app',
  jwtSecret: (process.env.JWT_SECRET || 'your-secret-key') as Secret,
  jwtExpire: (process.env.JWT_EXPIRE || '30d') as SignOptions['expiresIn'],
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
};

export default config;
