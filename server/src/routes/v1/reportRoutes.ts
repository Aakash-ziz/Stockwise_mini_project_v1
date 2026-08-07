import { Router } from 'express';
import { getSummary, getPerformance } from '../../controllers/reportController.js';

const router = Router();

router.get('/summary', getSummary);
router.get('/performance', getPerformance);

export default router;
