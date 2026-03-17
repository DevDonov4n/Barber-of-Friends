import { Router } from 'express';
import { registerOrLogin } from '../controllers/authController';

const router = Router();

router.post('/login', registerOrLogin);

export default router;
