import { Router } from 'express';
import {
  adminUpcoming,
  createAppointment,
  getAvailableSlots,
  updateStatus
} from '../controllers/appointmentController';

const router = Router();

router.get('/slots', getAvailableSlots);
router.post('/', createAppointment);
router.patch('/:id', updateStatus);
router.get('/admin/upcoming', adminUpcoming);

export default router;
