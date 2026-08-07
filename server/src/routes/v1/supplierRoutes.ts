import { Router } from 'express';
import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../../controllers/supplierController.js';
import {
  createSupplierSchema,
  updateSupplierSchema,
  getSupplierByIdSchema,
  listSuppliersSchema,
} from '../../validators/supplierValidator.js';
import { validateRequest } from '../../middleware/validate.js';

const router = Router();

router.get('/', validateRequest(listSuppliersSchema), getSuppliers);
router.get('/:id', validateRequest(getSupplierByIdSchema), getSupplierById);
router.post('/', validateRequest(createSupplierSchema), createSupplier);
router.put('/:id', validateRequest(updateSupplierSchema), updateSupplier);
router.delete('/:id', validateRequest(getSupplierByIdSchema), deleteSupplier);

export default router;
