import { execute } from '../../db/config.js';
import oracledb from 'oracledb';

const defaultSelectOptions = { outFormat: oracledb.OUT_FORMAT_ARRAY };

// Create SLA
export const createSla = async (slaData) => {
  const query = `
    INSERT INTO SLAS (
      slaId, daysCount, isActive, createdOn, modifiedOn
    )
    VALUES (
      :slaId, :daysCount, :isActive, SYSDATE, SYSDATE
    )
    RETURNING slaId, daysCount, isActive, createdOn, modifiedOn
    INTO :outSlaId, :outDaysCount, :outIsActive, :outCreatedOn, :outModifiedOn
  `;
  const binds = {
    slaId: slaData.slaId || null,
    daysCount: slaData.daysCount,
    isActive: slaData.isActive !== undefined ? (slaData.isActive ? 1 : 0) : 1,
    outSlaId: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
    outDaysCount: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    outIsActive: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    outCreatedOn: { dir: oracledb.BIND_OUT, type: oracledb.DATE },
    outModifiedOn: { dir: oracledb.BIND_OUT, type: oracledb.DATE }
  };
  const result = await execute(query, binds);
  return {
    slaId: Array.isArray(result.outBinds.outSlaId) ? result.outBinds.outSlaId[0] : result.outBinds.outSlaId,
    daysCount: Array.isArray(result.outBinds.outDaysCount) ? result.outBinds.outDaysCount[0] : result.outBinds.outDaysCount,
    isActive: (Array.isArray(result.outBinds.outIsActive) ? result.outBinds.outIsActive[0] : result.outBinds.outIsActive) === 1,
    createdOn: Array.isArray(result.outBinds.outCreatedOn) ? result.outBinds.outCreatedOn[0] : result.outBinds.outCreatedOn,
    modifiedOn: Array.isArray(result.outBinds.outModifiedOn) ? result.outBinds.outModifiedOn[0] : result.outBinds.outModifiedOn
  };
};

// Get SLA by ID
export const getSlaById = async (slaId) => {
  const query = `
    SELECT slaId, daysCount, isActive, createdOn, modifiedOn
    FROM SLAS
    WHERE slaId = :slaId
  `;
  const result = await execute(query, { slaId }, defaultSelectOptions);
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    slaId: row[0],
    daysCount: row[1],
    isActive: row[2] === 1,
    createdOn: row[3],
    modifiedOn: row[4]
  };
};

// Get all SLAs
export const getAllSlas = async () => {
  const query = `
    SELECT slaId, daysCount, isActive, createdOn, modifiedOn
    FROM SLAS
    ORDER BY slaId
  `;
  const result = await execute(query, {}, defaultSelectOptions);
  return result.rows.map(row => ({
    slaId: row[0],
    daysCount: row[1],
    isActive: row[2] === 1,
    createdOn: row[3],
    modifiedOn: row[4]
  }));
};

// Update SLA
export const updateSla = async (slaId, slaData) => {
  const query = `
    UPDATE SLAS
    SET daysCount = :daysCount,
        isActive = :isActive,
        modifiedOn = SYSDATE
    WHERE slaId = :slaId
    RETURNING slaId, daysCount, isActive, createdOn, modifiedOn
    INTO :outSlaId, :outDaysCount, :outIsActive, :outCreatedOn, :outModifiedOn
  `;
  const binds = {
    slaId,
    daysCount: slaData.daysCount,
    isActive: slaData.isActive !== undefined ? (slaData.isActive ? 1 : 0) : 1,
    outSlaId: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
    outDaysCount: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    outIsActive: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    outCreatedOn: { dir: oracledb.BIND_OUT, type: oracledb.DATE },
    outModifiedOn: { dir: oracledb.BIND_OUT, type: oracledb.DATE }
  };
  const result = await execute(query, binds);
  if (result.rowsAffected === 0) return null;
  return {
    slaId: Array.isArray(result.outBinds.outSlaId) ? result.outBinds.outSlaId[0] : result.outBinds.outSlaId,
    daysCount: Array.isArray(result.outBinds.outDaysCount) ? result.outBinds.outDaysCount[0] : result.outBinds.outDaysCount,
    isActive: (Array.isArray(result.outBinds.outIsActive) ? result.outBinds.outIsActive[0] : result.outBinds.outIsActive) === 1,
    createdOn: Array.isArray(result.outBinds.outCreatedOn) ? result.outBinds.outCreatedOn[0] : result.outBinds.outCreatedOn,
    modifiedOn: Array.isArray(result.outBinds.outModifiedOn) ? result.outBinds.outModifiedOn[0] : result.outBinds.outModifiedOn
  };
};

// Delete SLA
export const deleteSla = async (slaId) => {
  const query = `DELETE FROM SLAS WHERE slaId = :slaId`;
  const result = await execute(query, { slaId });
  return result.rowsAffected > 0;
};

// SLAs for dropdown
export const getSlasForDropdown = async () => {
  const query = `
    SELECT slaId, daysCount
    FROM SLAS
    WHERE isActive = 1
    ORDER BY daysCount
  `;
  const result = await execute(query, {}, defaultSelectOptions);
  return result.rows.map(row => ({
    value: row[0],
    label: `SLA ${row[1]} days`
  }));
};
