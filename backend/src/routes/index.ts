import { Router } from 'express';
import authRoutes from './authRoutes';
import appointmentRoutes from './appointmentRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/agendamentos', appointmentRoutes);

export default router;
