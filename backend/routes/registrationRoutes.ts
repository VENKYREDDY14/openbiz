import { Router } from 'express';
import { register, getUdyamFields } from '../controllers/registrationController';

const router = Router();

router.post('/register', register);
router.get('/udyam-fields', getUdyamFields);

export default router;
