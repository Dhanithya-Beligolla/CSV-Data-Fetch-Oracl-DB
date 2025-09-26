import {
  createDepartment as createDepartmentService,
  getDepartmentById,
  getAllDepartments as getAllDepartmentsService,
  updateDepartment as updateDepartmentService,
  deleteDepartment as deleteDepartmentService,
  getDepartmentsForDropdown as getDepartmentsForDropdownService
} from '../../services/masterdata/departmentService.js';

// Create Department
export const createDepartment = async (req, res) => {
  try {
    const { departmentName, isActive } = req.body;
    if (!departmentName) {
      return res.status(400).json({ error: 'departmentName is required' });
    }

    const newDepartment = await createDepartmentService({
      departmentName,
      isActive
    });

    res.status(201).json(newDepartment);
  } catch (err) {
    console.error('Error creating department:', err);
    res.status(500).json({ error: 'Failed to create department' });
  }
};

// Get Department by ID
export const getDepartment = async (req, res) => {
  try {
    const department = await getDepartmentById(req.params.departmentId);
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.json(department);
  } catch (err) {
    console.error('Error fetching department:', err);
    res.status(500).json({ error: 'Failed to fetch department' });
  }
};

// Get All Departments
export const getAllDepartments = async (req, res) => {
  try {
    const departments = await getAllDepartmentsService();
    res.json(departments);
  } catch (err) {
    console.error('Error fetching departments:', err);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
};

// Update Department
export const updateDepartment = async (req, res) => {
  try {
    const { departmentName, isActive } = req.body;
    if (!departmentName) {
      return res.status(400).json({ error: 'departmentName is required' });
    }

    const updatedDepartment = await updateDepartmentService(
      req.params.departmentId,
      { departmentName, isActive }
    );

    if (!updatedDepartment) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json(updatedDepartment);
  } catch (err) {
    console.error('Error updating department:', err);
    res.status(500).json({ error: 'Failed to update department' });
  }
};

// Delete Department
export const deleteDepartment = async (req, res) => {
  try {
    const deleted = await deleteDepartmentService(req.params.departmentId);
    if (!deleted) {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting department:', err);
    if (err.message.includes('ORA-02292')) {
      return res.status(400).json({ error: 'Cannot delete department: referenced by other records' });
    }
    res.status(500).json({ error: 'Failed to delete department' });
  }
};

// Get Departments for Dropdown
export const getDepartmentsForDropdown = async (req, res) => {
  try {
    const departments = await getDepartmentsForDropdownService();
    res.json(departments);
  } catch (err) {
    console.error('Error fetching departments for dropdown:', err);
    res.status(500).json({ error: 'Failed to fetch departments for dropdown' });
  }
};
