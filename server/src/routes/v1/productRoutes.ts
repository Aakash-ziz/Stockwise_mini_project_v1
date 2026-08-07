import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../controllers/productController.js';
import {
  createProductSchema,
  updateProductSchema,
  getProductByIdSchema,
  listProductsSchema,
} from '../../validators/productValidator.js';
import { validateRequest } from '../../middleware/validate.js';

const router = Router();

router.get('/', validateRequest(listProductsSchema), getProducts);
router.get('/:id', validateRequest(getProductByIdSchema), getProductById);
router.post('/', validateRequest(createProductSchema), createProduct);
router.put('/:id', validateRequest(updateProductSchema), updateProduct);
router.delete('/:id', validateRequest(getProductByIdSchema), deleteProduct);

export default router;
