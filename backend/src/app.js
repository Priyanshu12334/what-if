import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import dailyRoutes from './routes/dailyRoutes.js';
import askRoutes from './routes/askRoutes.js';
import exploreRoutes from './routes/exploreRoutes.js';

const app = express();

const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS);
if (Number.isInteger(trustProxyHops) && trustProxyHops > 0) app.set('trust proxy', trustProxyHops);

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000'
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/daily', dailyRoutes);
app.use('/api/ask', askRoutes);
app.use('/api/categories', exploreRoutes);

export default app;
