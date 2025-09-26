import express from 'express';
import {
	createSla,
	getSla,
	getAllSlas,
	updateSla,
	deleteSla,
	getSlasForDropdown
} from '../../controllers/masterdata/slaController.js';

const router = express.Router();
// import authenticate from '../../middleware/auth.js';

// Dropdown endpoint
router.get('/dropdown', getSlasForDropdown);

router.post('/', createSla);
router.get('/:slaId', getSla);
router.get('/', getAllSlas);
router.put('/:slaId', updateSla);
router.delete('/:slaId', deleteSla);

export default router;
