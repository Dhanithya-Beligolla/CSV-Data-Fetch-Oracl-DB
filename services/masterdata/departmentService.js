import { execute } from '../../db/config.js';
import oracledb from 'oracledb';

const defaultSelectOptions = { outFormat: oracledb.OUT_FORMAT_ARRAY };

// Create Department
export const createDepartment = async (departmentData) => {
  const query = `
    INSERT INTO DEPARTMENTS (
      departmentId, departmentName, isActive, createdOn, modifiedOn
    )
    VALUES (
      :departmentId, :departmentName, :isActive, SYSDATE, SYSDATE
    )
    RETURNING 
      departmentId, departmentName, isActive, createdOn, modifiedOn
    INTO 
      :outDepartmentId, :outDepartmentName, :outIsActive, :outCreatedOn, :outModifiedOn
  `;
  const binds = {
    departmentId: departmentData.departmentId || null, // trigger generates ID if null
    departmentName: departmentData.departmentName,
    isActive: departmentData.isActive !== undefined ? (departmentData.isActive ? 1 : 0) : 1,
    outDepartmentId: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
    outDepartmentName: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
    outIsActive: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    outCreatedOn: { dir: oracledb.BIND_OUT, type: oracledb.DATE },
    outModifiedOn: { dir: oracledb.BIND_OUT, type: oracledb.DATE }
  };

  const result = await execute(query, binds);
  return {
    departmentId: Array.isArray(result.outBinds.outDepartmentId) ? result.outBinds.outDepartmentId[0] : result.outBinds.outDepartmentId,
    departmentName: Array.isArray(result.outBinds.outDepartmentName) ? result.outBinds.outDepartmentName[0] : result.outBinds.outDepartmentName,
    isActive: (Array.isArray(result.outBinds.outIsActive) ? result.outBinds.outIsActive[0] : result.outBinds.outIsActive) === 1,
    createdOn: Array.isArray(result.outBinds.outCreatedOn) ? result.outBinds.outCreatedOn[0] : result.outBinds.outCreatedOn,
    modifiedOn: Array.isArray(result.outBinds.outModifiedOn) ? result.outBinds.outModifiedOn[0] : result.outBinds.outModifiedOn
  };
};

// Get Department by ID
export const getDepartmentById = async (departmentId) => {
  const query = `
    SELECT departmentId, departmentName, isActive, createdOn, modifiedOn
    FROM DEPARTMENTS
    WHERE departmentId = :departmentId
  `;
  const result = await execute(query, { departmentId }, defaultSelectOptions);
  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    departmentId: row[0],
    departmentName: row[1],
    isActive: row[2] === 1,
    createdOn: row[3],
    modifiedOn: row[4]
  };
};

// Get All Departments
export const getAllDepartments = async () => {
  const query = `
    SELECT departmentId, departmentName, isActive, createdOn, modifiedOn
    FROM DEPARTMENTS
    ORDER BY departmentId
  `;
  const result = await execute(query, {}, defaultSelectOptions);
  return result.rows.map(row => ({
    departmentId: row[0],
    departmentName: row[1],
    isActive: row[2] === 1,
    createdOn: row[3],
    modifiedOn: row[4]
  }));
};

// Update Department
export const updateDepartment = async (departmentId, departmentData) => {
  const query = `
    UPDATE DEPARTMENTS
    SET departmentName = :departmentName,
        isActive = :isActive,
        modifiedOn = SYSDATE
    WHERE departmentId = :departmentId
    RETURNING 
      departmentId, departmentName, isActive, createdOn, modifiedOn
    INTO 
      :outDepartmentId, :outDepartmentName, :outIsActive, :outCreatedOn, :outModifiedOn
  `;
  const binds = {
    departmentId,
    departmentName: departmentData.departmentName,
    isActive: departmentData.isActive !== undefined ? (departmentData.isActive ? 1 : 0) : 1,
    outDepartmentId: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
    outDepartmentName: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
    outIsActive: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    outCreatedOn: { dir: oracledb.BIND_OUT, type: oracledb.DATE },
    outModifiedOn: { dir: oracledb.BIND_OUT, type: oracledb.DATE }
  };

  const result = await execute(query, binds);
  if (result.rowsAffected === 0) return null;

  return {
    departmentId: Array.isArray(result.outBinds.outDepartmentId) ? result.outBinds.outDepartmentId[0] : result.outBinds.outDepartmentId,
    departmentName: Array.isArray(result.outBinds.outDepartmentName) ? result.outBinds.outDepartmentName[0] : result.outBinds.outDepartmentName,
    isActive: (Array.isArray(result.outBinds.outIsActive) ? result.outBinds.outIsActive[0] : result.outBinds.outIsActive) === 1,
    createdOn: Array.isArray(result.outBinds.outCreatedOn) ? result.outBinds.outCreatedOn[0] : result.outBinds.outCreatedOn,
    modifiedOn: Array.isArray(result.outBinds.outModifiedOn) ? result.outBinds.outModifiedOn[0] : result.outBinds.outModifiedOn
  };
};

// Delete Department
export const deleteDepartment = async (departmentId) => {
  const query = `
    DELETE FROM DEPARTMENTS
    WHERE departmentId = :departmentId
  `;
  const result = await execute(query, { departmentId });
  return result.rowsAffected > 0;
};

// Get Departments for Dropdown
export const getDepartmentsForDropdown = async () => {
  const query = `
    SELECT departmentId, departmentName
    FROM DEPARTMENTS
    WHERE isActive = 1
    ORDER BY departmentName
  `;
  const result = await execute(query, {}, defaultSelectOptions);
  return result.rows.map(row => ({
    value: row[0],
    label: row[1]
  }));
};
