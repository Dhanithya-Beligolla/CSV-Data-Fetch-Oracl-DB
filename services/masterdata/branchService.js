import { execute } from '../../db/config.js';
import oracledb from 'oracledb';

const defaultSelectOptions = { outFormat: oracledb.OUT_FORMAT_ARRAY };

export const createBranch = async (branchData) => {
  const query = `
    INSERT INTO BRANCHES (
      branchId, branchName,  isActive, createdOn, modifiedOn
    )
    VALUES (
      :branchId, :branchName, :isActive, SYSDATE, SYSDATE
    )
    RETURNING 
      branchId, branchName,  isActive, createdOn, modifiedOn 
    INTO 
      :outBranchId, :outBranchName, :outIsActive, :outCreatedOn, :outModifiedOn
  `;
  const binds = {
    branchId: branchData.branchId || null, // Allow null for trigger to generate
    branchName: branchData.branchName,
    isActive: branchData.isActive !== undefined ? (branchData.isActive ? 1 : 0) : 1,
    outBranchId: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
    outBranchName: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
    outIsActive: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    outCreatedOn: { dir: oracledb.BIND_OUT, type: oracledb.DATE },
    outModifiedOn: { dir: oracledb.BIND_OUT, type: oracledb.DATE }
  };
  const result = await execute(query, binds);
  return {
    branchId: Array.isArray(result.outBinds.outBranchId) ? result.outBinds.outBranchId[0] : result.outBinds.outBranchId,
    branchName: Array.isArray(result.outBinds.outBranchName) ? result.outBinds.outBranchName[0] : result.outBinds.outBranchName,
    isActive: (Array.isArray(result.outBinds.outIsActive) ? result.outBinds.outIsActive[0] : result.outBinds.outIsActive) === 1,
    createdOn: Array.isArray(result.outBinds.outCreatedOn) ? result.outBinds.outCreatedOn[0] : result.outBinds.outCreatedOn,
    modifiedOn: Array.isArray(result.outBinds.outModifiedOn) ? result.outBinds.outModifiedOn[0] : result.outBinds.outModifiedOn
  };
};

export const getBranchById = async (branchId) => {
  const query = `
    SELECT branchId, branchName, isActive, createdOn, modifiedOn
    FROM BRANCHES
    WHERE branchId = :branchId
  `;
  const result = await execute(query, { branchId }, defaultSelectOptions);
  if (result.rows.length === 0) return null;
  return {
    branchId: result.rows[0][0], // BRANCHID
    branchName: result.rows[0][1], // BRANCHNAME
    isActive: result.rows[0][2] === 1, // ISACTIVE
    createdOn: result.rows[0][3], // CREATEDON
    modifiedOn: result.rows[0][4] // MODIFIEDON
  };
};

export const getAllBranches = async () => {
  const query = `
    SELECT branchId, branchName, isActive, createdOn, modifiedOn
    FROM BRANCHES
    ORDER BY branchId
  `;
  const result = await execute(query, {}, defaultSelectOptions);
  return result.rows.map(row => ({
    branchId: row[0], // BRANCHID
    branchName: row[1], // BRANCHNAME
    isActive: row[2] === 1, // ISACTIVE
    createdOn: row[3], // CREATEDON
    modifiedOn: row[4] // MODIFIEDON
  }));
};

export const updateBranch = async (branchId, branchData) => {
  const query = `
    UPDATE BRANCHES
    SET branchName = :branchName,
        isActive = :isActive,
        createdOn = :createdOn,
        modifiedOn = :modifiedOn
    WHERE branchId = :branchId
    RETURNING 
      branchId, branchName, isActive, createdOn, modifiedOn
    INTO 
      :outBranchId, :outBranchName, :outIsActive, :outCreatedOn, :outModifiedOn
  `;
  const binds = {
    branchId,
    branchName: branchData.branchName,
    isActive: branchData.isActive !== undefined ? (branchData.isActive ? 1 : 0) : 1,
    createdOn: branchData.createdOn || null,
    modifiedOn: branchData.modifiedOn || null,
    outBranchId: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
    outBranchName: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
    outIsActive: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    outCreatedOn: { dir: oracledb.BIND_OUT, type: oracledb.DATE },
    outModifiedOn: { dir: oracledb.BIND_OUT, type: oracledb.DATE }
  };
  const result = await execute(query, binds);
  if (result.rowsAffected === 0) return null;
  return {
    branchId: Array.isArray(result.outBinds.outBranchId) ? result.outBinds.outBranchId[0] : result.outBinds.outBranchId,
    branchName: Array.isArray(result.outBinds.outBranchName) ? result.outBinds.outBranchName[0] : result.outBinds.outBranchName,
    isActive: (Array.isArray(result.outBinds.outIsActive) ? result.outBinds.outIsActive[0] : result.outBinds.outIsActive) === 1,
    createdOn: Array.isArray(result.outBinds.outCreatedOn) ? result.outBinds.outCreatedOn[0] : result.outBinds.outCreatedOn,
    modifiedOn: Array.isArray(result.outBinds.outModifiedOn) ? result.outBinds.outModifiedOn[0] : result.outBinds.outModifiedOn
  };
};


export const getBranchesForDropdown = async () => {
  const query = `
    SELECT branchId, branchName
    FROM BRANCHES
    WHERE isActive = 1
    ORDER BY branchName
  `;
  const result = await execute(query, {}, defaultSelectOptions);
  return result.rows.map(row => ({
    value: row[0], // branchId
    label: row[1]  // branchName
  }));
};

export const deleteBranch = async (branchId) => {
  const query = `
    DELETE FROM BRANCHES
    WHERE branchId = :branchId
  `;
  const result = await execute(query, { branchId });
  return result.rowsAffected > 0;
};
