import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();

// ─── Middleware ─────────────────────────────────────────────────────────────
const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ['*'];
app.use(cors({ 
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }, 
  credentials: true 
}));
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
import favoriteRoutes from './routes/favorite.routes';
import resourceRoutes from './routes/resource.routes';
import chatRoutes from './routes/chat.routes';

// ─── Routes (thêm dần theo từng feature) ────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/chat', chatRoutes);
// ─── Global Error Handler (phải ở cuối) ─────────────────────────────────────
app.use(errorMiddleware);

export default app;
