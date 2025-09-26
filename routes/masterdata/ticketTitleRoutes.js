import express from 'express';
import {
	createTicketTitle,
	getTicketTitle,
	getAllTicketTitles,
	updateTicketTitle,
	deleteTicketTitle,
	getTicketTitlesForDropdown
} from '../../controllers/masterdata/ticketTitleController.js';

const router = express.Router();
// import authenticate from '../../middleware/auth.js';

// Dropdown endpoint
router.get('/dropdown', getTicketTitlesForDropdown);

router.post('/', createTicketTitle);
router.get('/:titleId', getTicketTitle);
router.get('/', getAllTicketTitles);
router.put('/:titleId', updateTicketTitle);
router.delete('/:titleId', deleteTicketTitle);

export default router;
``
