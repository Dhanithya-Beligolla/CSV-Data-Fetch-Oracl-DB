import express from 'express';
import {
	createBranch,
	getBranch,
	getAllBranches,
	updateBranch,
	deleteBranch
} from '../../controllers/masterdata/branchController.js';

const router = express.Router();
// import authenticate from '../../middleware/auth.js';

// // Dropdown endpoint - accessible to all authenticated users
// router.get('/dropdown', authenticate(['Initiator', 'BranchManager', 'CoverupBranchManager', 'RelationshipManager', 'Relationship Manager', 'CentralCoordinator', 'Credit Hub Coordinator', 'RCC Officer', 'Duel Role (Hub Coordinator + RCC Officer)', 'SuperAdmin', 'Admin']), branchController.getBranchesForDropdown);

// router.post('/', authenticate(['SuperAdmin', 'Admin']), branchController.createBranch);
// router.get('/:branchId', authenticate(['SuperAdmin', 'Admin']), branchController.getBranch);
// router.get('/', authenticate(['SuperAdmin', 'Admin']), branchController.getAllBranches);
// router.put('/:branchId', authenticate(['SuperAdmin', 'Admin']), branchController.updateBranch);
// router.delete('/:branchId', authenticate(['SuperAdmin', 'Admin']), branchController.deleteBranch);


router.post('/', createBranch);
router.get('/:branchId', getBranch);
router.get('/', getAllBranches);
router.put('/:branchId', updateBranch);
router.delete('/:branchId', deleteBranch);

export default router;

