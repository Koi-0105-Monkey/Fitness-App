import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL ?? '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health check ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'FITBODY API is running 🏋️' });
});

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import workoutRoutes from './routes/workout.routes';
import uploadRoutes from './routes/upload.routes';

// ─── Routes (thêm dần theo từng feature) ────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/upload', uploadRoutes);
// ─── Global Error Handler (phải ở cuối) ─────────────────────────────────────
app.use(errorMiddleware);

export default app;
