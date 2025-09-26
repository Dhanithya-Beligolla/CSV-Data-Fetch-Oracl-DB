import express from 'express';
import {
	createDepartment,
	getDepartment,
	getAllDepartments,
	updateDepartment,
	deleteDepartment,
	getDepartmentsForDropdown
} from '../../controllers/masterdata/departmentController.js';

const router = express.Router();
// import authenticate from '../../middleware/auth.js';

// Dropdown endpoint
router.get('/dropdown', getDepartmentsForDropdown);

router.post('/', createDepartment);
router.get('/:departmentId', getDepartment);
router.get('/', getAllDepartments);
router.put('/:departmentId', updateDepartment);
router.delete('/:departmentId', deleteDepartment);

export default router;
