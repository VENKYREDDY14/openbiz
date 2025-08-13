import { Router } from 'express';
import { register, getUdyamFields, refreshUdyamFields } from '../controllers/registrationController';

const router = Router();

router.post('/register', register);
router.get('/udyam-fields', getUdyamFields);
router.post('/udyam-fields/refresh', refreshUdyamFields);

export default router;
