import {
  createSla as createSlaService,
  getSlaById,
  getAllSlas as getAllSlasService,
  updateSla as updateSlaService,
  deleteSla as deleteSlaService,
  getSlasForDropdown as getSlasForDropdownService
} from '../../services/masterdata/slaService.js';

// Create SLA
export const createSla = async (req, res) => {
  try {
    const { daysCount, isActive } = req.body;
    if (daysCount === undefined) {
      return res.status(400).json({ error: 'daysCount is required' });
    }

    const newSla = await createSlaService({
      daysCount,
      isActive
    });

    res.status(201).json(newSla);
  } catch (err) {
    console.error('Error creating SLA:', err);
    res.status(500).json({ error: 'Failed to create SLA' });
  }
};

// Get SLA by ID
export const getSla = async (req, res) => {
  try {
    const sla = await getSlaById(req.params.slaId);
    if (!sla) {
      return res.status(404).json({ error: 'SLA not found' });
    }
    res.json(sla);
  } catch (err) {
    console.error('Error fetching SLA:', err);
    res.status(500).json({ error: 'Failed to fetch SLA' });
  }
};

// Get All SLAs
export const getAllSlas = async (req, res) => {
  try {
    const slas = await getAllSlasService();
    res.json(slas);
  } catch (err) {
    console.error('Error fetching SLAs:', err);
    res.status(500).json({ error: 'Failed to fetch SLAs' });
  }
};

// Update SLA
export const updateSla = async (req, res) => {
  try {
    const { daysCount, isActive } = req.body;
    if (daysCount === undefined) {
      return res.status(400).json({ error: 'daysCount is required' });
    }

    const updatedSla = await updateSlaService(req.params.slaId, {
      daysCount,
      isActive
    });

    if (!updatedSla) {
      return res.status(404).json({ error: 'SLA not found' });
    }

    res.json(updatedSla);
  } catch (err) {
    console.error('Error updating SLA:', err);
    res.status(500).json({ error: 'Failed to update SLA' });
  }
};

// Delete SLA
export const deleteSla = async (req, res) => {
  try {
    const deleted = await deleteSlaService(req.params.slaId);
    if (!deleted) {
      return res.status(404).json({ error: 'SLA not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting SLA:', err);
    if (err.message.includes('ORA-02292')) {
      return res.status(400).json({ error: 'Cannot delete SLA: referenced by other records' });
    }
    res.status(500).json({ error: 'Failed to delete SLA' });
  }
};

// Get SLAs for Dropdown
export const getSlasForDropdown = async (req, res) => {
  try {
    const slas = await getSlasForDropdownService();
    res.json(slas);
  } catch (err) {
    console.error('Error fetching SLAs for dropdown:', err);
    res.status(500).json({ error: 'Failed to fetch SLAs for dropdown' });
  }
};
