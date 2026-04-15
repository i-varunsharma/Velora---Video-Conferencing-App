import cors from 'cors';
import { env } from './environment';

export const corsOptions: cors.CorsOptions = {
  origin: [env.FRONTEND_URL],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
