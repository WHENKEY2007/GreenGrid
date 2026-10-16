import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import deviceRoutes from './device.routes';
import consumptionRoutes from './consumption.routes';
import renewableRoutes from './renewable.routes';
import analyticsRoutes from './analytics.routes';
import recommendationRoutes from './recommendation.routes';
import alertRoutes from './alert.routes';
import settingsRoutes from './settings.routes';
import reportRoutes from './report.routes';
import adminRoutes from './admin.routes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/devices', deviceRoutes);
apiRouter.use('/consumption', consumptionRoutes);
apiRouter.use('/renewable', renewableRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/recommendations', recommendationRoutes);
apiRouter.use('/alerts', alertRoutes);
apiRouter.use('/settings', settingsRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/admin', adminRoutes);

export default apiRouter;
