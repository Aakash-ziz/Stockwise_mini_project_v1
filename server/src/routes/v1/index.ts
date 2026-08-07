import { Router } from 'express';
import categoryRoutes from './categoryRoutes.js';
import supplierRoutes from './supplierRoutes.js';
import productRoutes from './productRoutes.js';
import salesRoutes from './salesRoutes.js';
import reportRoutes from './reportRoutes.js';

const router = Router();

router.use('/categories', categoryRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/products', productRoutes);
router.use('/sales', salesRoutes);
router.use('/reports', reportRoutes);

export default router;
