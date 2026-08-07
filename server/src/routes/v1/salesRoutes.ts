import { Router } from 'express';
import {
  getSales,
  getSaleById,
  createSale,
  updateSaleStatus,
  cancelSale,
} from '../../controllers/salesController.js';
import {
  createSaleSchema,
  updateSaleStatusSchema,
  getSaleByIdSchema,
  listSalesSchema,
} from '../../validators/salesValidator.js';
import { validateRequest } from '../../middleware/validate.js';

const router = Router();

router.get('/', validateRequest(listSalesSchema), getSales);
router.get('/:id', validateRequest(getSaleByIdSchema), getSaleById);
router.post('/', validateRequest(createSaleSchema), createSale);
router.put('/:id/status', validateRequest(updateSaleStatusSchema), updateSaleStatus);
router.delete('/:id', validateRequest(getSaleByIdSchema), cancelSale);

export default router;
