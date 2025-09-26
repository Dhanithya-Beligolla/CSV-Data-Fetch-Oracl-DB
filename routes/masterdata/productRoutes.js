import express from 'express';
import {
	createProduct,
	getProduct,
	getAllProducts,
	updateProduct,
	deleteProduct,
	getProductsForDropdown
} from '../../controllers/masterdata/productController.js';

const router = express.Router();
// import authenticate from '../../middleware/auth.js';

// Dropdown endpoint
router.get('/dropdown', getProductsForDropdown);

router.post('/', createProduct);
router.get('/:productId', getProduct);
router.get('/', getAllProducts);
router.put('/:productId', updateProduct);
router.delete('/:productId', deleteProduct);

export default router;
