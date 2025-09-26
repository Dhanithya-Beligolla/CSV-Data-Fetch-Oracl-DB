import {
  createTicketTitle as createTicketTitleService,
  getTicketTitleById,
  getAllTicketTitles as getAllTicketTitlesService,
  updateTicketTitle as updateTicketTitleService,
  deleteTicketTitle as deleteTicketTitleService,
  getTicketTitlesForDropdown as getTicketTitlesForDropdownService
} from '../../services/masterdata/ticketTitleService.js';

// Create Ticket Title
export const createTicketTitle = async (req, res) => {
  try {
    const { productId, departmentId, slaId, title, isActive } = req.body;
    if (!productId || !departmentId || !slaId || !title) {
      return res.status(400).json({ error: 'productId, departmentId, slaId, and title are required' });
    }

    const newTitle = await createTicketTitleService({
      productId,
      departmentId,
      slaId,
      title,
      isActive
    });

    res.status(201).json(newTitle);
  } catch (err) {
    console.error('Error creating ticket title:', err);
    if (err.message.includes('ORA-02291')) {
      return res.status(400).json({ error: 'Invalid foreign key: productId, departmentId, or slaId does not exist' });
    }
    res.status(500).json({ error: 'Failed to create ticket title' });
  }
};

// Get Ticket Title by ID
export const getTicketTitle = async (req, res) => {
  try {
    const title = await getTicketTitleById(req.params.titleId);
    if (!title) {
      return res.status(404).json({ error: 'Ticket Title not found' });
    }
    res.json(title);
  } catch (err) {
    console.error('Error fetching ticket title:', err);
    res.status(500).json({ error: 'Failed to fetch ticket title' });
  }
};

// Get All Ticket Titles
export const getAllTicketTitles = async (req, res) => {
  try {
    const titles = await getAllTicketTitlesService();
    res.json(titles);
  } catch (err) {
    console.error('Error fetching ticket titles:', err);
    res.status(500).json({ error: 'Failed to fetch ticket titles' });
  }
};

// Update Ticket Title
export const updateTicketTitle = async (req, res) => {
  try {
    const { productId, departmentId, slaId, title, isActive } = req.body;
    if (!productId || !departmentId || !slaId || !title) {
      return res.status(400).json({ error: 'productId, departmentId, slaId, and title are required' });
    }

    const updatedTitle = await updateTicketTitleService(req.params.titleId, {
      productId,
      departmentId,
      slaId,
      title,
      isActive
    });

    if (!updatedTitle) {
      return res.status(404).json({ error: 'Ticket Title not found' });
    }

    res.json(updatedTitle);
  } catch (err) {
    console.error('Error updating ticket title:', err);
    if (err.message.includes('ORA-02291')) {
      return res.status(400).json({ error: 'Invalid foreign key: productId, departmentId, or slaId does not exist' });
    }
    res.status(500).json({ error: 'Failed to update ticket title' });
  }
};

// Delete Ticket Title
export const deleteTicketTitle = async (req, res) => {
  try {
    const deleted = await deleteTicketTitleService(req.params.titleId);
    if (!deleted) {
      return res.status(404).json({ error: 'Ticket Title not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting ticket title:', err);
    if (err.message.includes('ORA-02292')) {
      return res.status(400).json({ error: 'Cannot delete ticket title: referenced by other records' });
    }
    res.status(500).json({ error: 'Failed to delete ticket title' });
  }
};

// Get Ticket Titles for Dropdown
export const getTicketTitlesForDropdown = async (req, res) => {
  try {
    const titles = await getTicketTitlesForDropdownService();
    res.json(titles);
  } catch (err) {
    console.error('Error fetching ticket titles for dropdown:', err);
    res.status(500).json({ error: 'Failed to fetch ticket titles for dropdown' });
  }
};
