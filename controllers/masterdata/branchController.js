import {
  createBranch as createBranchService,
  getBranchById,
  getAllBranches as getAllBranchesService,
  updateBranch as updateBranchService,
  deleteBranch as deleteBranchService,
  getBranchesForDropdown as getBranchesForDropdownService
} from '../../services/masterdata/branchService.js';

export const createBranch = async (req, res) => {
  try {
    const { branchName, isActive } = req.body;
    if (!branchName) {
      return res.status(400).json({ error: 'branchName is required' });
    }
    const newBranch = await createBranchService({
      branchName,
      isActive
    });
    res.status(201).json(newBranch);
  } catch (err) {
    console.error('Error creating branch:', err);
    if (err.message.includes('ORA-02291')) {
      return res.status(400).json({ error: 'Invalid foreign key: branchManagerId, coverUpManagerId, or creditHubId does not exist' });
    }
    res.status(500).json({ error: 'Failed to create branch' });
  }
};

export const getBranch = async (req, res) => {
  try {
    const branch = await getBranchById(req.params.branchId);
    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    res.json(branch);
  } catch (err) {
    console.error('Error fetching branch:', err);
    res.status(500).json({ error: 'Failed to fetch branch' });
  }
};

export const getAllBranches = async (req, res) => {
  try {
    const branches = await getAllBranchesService();
    res.json(branches);
  } catch (err) {
    console.error('Error fetching branches:', err);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
};

export const updateBranch = async (req, res) => {
  try {
    const { branchName, isActive } = req.body;
    if (!branchName) {
      return res.status(400).json({ error: 'branchName is required' });
    }
    const updatedBranch = await updateBranchService(req.params.branchId, {
      branchName,
      isActive
    });
    if (!updatedBranch) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    res.json(updatedBranch);
  } catch (err) {
    console.error('Error updating branch:', err);
    if (err.message.includes('ORA-02291')) {
      return res.status(400).json({ error: 'Invalid foreign key: branchManagerId, coverUpManagerId, or creditHubId does not exist' });
    }
    res.status(500).json({ error: 'Failed to update branch' });
  }
};

export const getBranchesForDropdown = async (req, res) => {
  try {
    const branches = await getBranchesForDropdownService();
    res.json(branches);
  } catch (err) {
    console.error('Error fetching branches for dropdown:', err);
    res.status(500).json({ error: 'Failed to fetch branches for dropdown' });
  }
};

export const deleteBranch = async (req, res) => {
  try {
    const deleted = await deleteBranchService(req.params.branchId);
    if (!deleted) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting branch:', err);
    if (err.message.includes('ORA-02292')) {
      return res.status(400).json({ error: 'Cannot delete branch: referenced by other records' });
    }
    res.status(500).json({ error: 'Failed to delete branch' });
  }
};