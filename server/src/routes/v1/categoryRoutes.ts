import { Router } from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../controllers/categoryController.js';
import {
  createCategorySchema,
  updateCategorySchema,
  getCategoryByIdSchema,
  listCategoriesSchema,
} from '../../validators/categoryValidator.js';
import { validateRequest } from '../../middleware/validate.js';

const router = Router();

router.get('/', validateRequest(listCategoriesSchema), getCategories);
router.get('/:id', validateRequest(getCategoryByIdSchema), getCategoryById);
router.post('/', validateRequest(createCategorySchema), createCategory);
router.put('/:id', validateRequest(updateCategorySchema), updateCategory);
router.delete('/:id', validateRequest(getCategoryByIdSchema), deleteCategory);

export default router;
