import { execute } from '../../db/config.js';
import oracledb from 'oracledb';

const defaultSelectOptions = { outFormat: oracledb.OUT_FORMAT_ARRAY };

// Create TicketTitle
export const createTicketTitle = async (titleData) => {
  const query = `
    INSERT INTO TICKETTITLES (
      titleId, productId, departmentId, slaId, title, isActive, createdOn, modifiedOn
    )
    VALUES (
      :titleId, :productId, :departmentId, :slaId, :title, :isActive, SYSDATE, SYSDATE
    )
    RETURNING titleId, productId, departmentId, slaId, title, isActive, createdOn, modifiedOn
    INTO :outTitleId, :outProductId, :outDepartmentId, :outSlaId, :outTitle, :outIsActive, :outCreatedOn, :outModifiedOn
  `;
  const binds = {
    titleId: titleData.titleId || null,
    productId: titleData.productId,
    departmentId: titleData.departmentId,
    slaId: titleData.slaId,
    title: titleData.title,
    isActive: titleData.isActive !== undefined ? (titleData.isActive ? 1 : 0) : 1,
    outTitleId: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
    outProductId: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
    outDepartmentId: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
    outSlaId: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
    outTitle: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
    outIsActive: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    outCreatedOn: { dir: oracledb.BIND_OUT, type: oracledb.DATE },
    outModifiedOn: { dir: oracledb.BIND_OUT, type: oracledb.DATE }
  };
  const result = await execute(query, binds);
  return {
    titleId: Array.isArray(result.outBinds.outTitleId) ? result.outBinds.outTitleId[0] : result.outBinds.outTitleId,
    productId: Array.isArray(result.outBinds.outProductId) ? result.outBinds.outProductId[0] : result.outBinds.outProductId,
    departmentId: Array.isArray(result.outBinds.outDepartmentId) ? result.outBinds.outDepartmentId[0] : result.outBinds.outDepartmentId,
    slaId: Array.isArray(result.outBinds.outSlaId) ? result.outBinds.outSlaId[0] : result.outBinds.outSlaId,
    title: Array.isArray(result.outBinds.outTitle) ? result.outBinds.outTitle[0] : result.outBinds.outTitle,
    isActive: (Array.isArray(result.outBinds.outIsActive) ? result.outBinds.outIsActive[0] : result.outBinds.outIsActive) === 1,
    createdOn: Array.isArray(result.outBinds.outCreatedOn) ? result.outBinds.outCreatedOn[0] : result.outBinds.outCreatedOn,
    modifiedOn: Array.isArray(result.outBinds.outModifiedOn) ? result.outBinds.outModifiedOn[0] : result.outBinds.outModifiedOn
  };
};

// Get TicketTitle by ID
export const getTicketTitleById = async (titleId) => {
  const query = `
    SELECT titleId, productId, departmentId, slaId, title, isActive, createdOn, modifiedOn
    FROM TICKETTITLES
    WHERE titleId = :titleId
  `;
  const result = await execute(query, { titleId }, defaultSelectOptions);
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    titleId: row[0],
    productId: row[1],
    departmentId: row[2],
    slaId: row[3],
    title: row[4],
    isActive: row[5] === 1,
    createdOn: row[6],
    modifiedOn: row[7]
  };
};

// Get all TicketTitles
export const getAllTicketTitles = async () => {
  const query = `
    SELECT titleId, productId, departmentId, slaId, title, isActive, createdOn, modifiedOn
    FROM TICKETTITLES
    ORDER BY titleId
  `;
  const result = await execute(query, {}, defaultSelectOptions);
  return result.rows.map(row => ({
    titleId: row[0],
    productId: row[1],
    departmentId: row[2],
    slaId: row[3],
    title: row[4],
    isActive: row[5] === 1,
    createdOn: row[6],
    modifiedOn: row[7]
  }));
};

// Update TicketTitle
export const updateTicketTitle = async (titleId, titleData) => {
  const query = `
    UPDATE TICKETTITLES
    SET productId = :productId,
        departmentId = :departmentId,
        slaId = :slaId,
        title = :title,
        isActive = :isActive,
        modifiedOn = SYSDATE
    WHERE titleId = :titleId
    RETURNING titleId, productId, departmentId, slaId, title, isActive, createdOn, modifiedOn
    INTO :outTitleId, :outProductId, :outDepartmentId, :outSlaId, :outTitle, :outIsActive, :outCreatedOn, :outModifiedOn
  `;
  const binds = {
    titleId,
    productId: titleData.productId,
    departmentId: titleData.departmentId,
    slaId: titleData.slaId,
    title: titleData.title,
    isActive: titleData.isActive !== undefined ? (titleData.isActive ? 1 : 0) : 1,
    outTitleId: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
    outProductId: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
    outDepartmentId: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
    outSlaId: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
    outTitle: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
    outIsActive: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    outCreatedOn: { dir: oracledb.BIND_OUT, type: oracledb.DATE },
    outModifiedOn: { dir: oracledb.BIND_OUT, type: oracledb.DATE }
  };
  const result = await execute(query, binds);
  if (result.rowsAffected === 0) return null;
  return {
    titleId: Array.isArray(result.outBinds.outTitleId) ? result.outBinds.outTitleId[0] : result.outBinds.outTitleId,
    productId: Array.isArray(result.outBinds.outProductId) ? result.outBinds.outProductId[0] : result.outBinds.outProductId,
    departmentId: Array.isArray(result.outBinds.outDepartmentId) ? result.outBinds.outDepartmentId[0] : result.outBinds.outDepartmentId,
    slaId: Array.isArray(result.outBinds.outSlaId) ? result.outBinds.outSlaId[0] : result.outBinds.outSlaId,
    title: Array.isArray(result.outBinds.outTitle) ? result.outBinds.outTitle[0] : result.outBinds.outTitle,
    isActive: (Array.isArray(result.outBinds.outIsActive) ? result.outBinds.outIsActive[0] : result.outBinds.outIsActive) === 1,
    createdOn: Array.isArray(result.outBinds.outCreatedOn) ? result.outBinds.outCreatedOn[0] : result.outBinds.outCreatedOn,
    modifiedOn: Array.isArray(result.outBinds.outModifiedOn) ? result.outBinds.outModifiedOn[0] : result.outBinds.outModifiedOn
  };
};

// Delete TicketTitle
export const deleteTicketTitle = async (titleId) => {
  const query = `DELETE FROM TICKETTITLES WHERE titleId = :titleId`;
  const result = await execute(query, { titleId });
  return result.rowsAffected > 0;
};

// TicketTitles for dropdown
export const getTicketTitlesForDropdown = async () => {
  const query = `
    SELECT titleId, title
    FROM TICKETTITLES
    WHERE isActive = 1
    ORDER BY title
  `;
  const result = await execute(query, {}, defaultSelectOptions);
  return result.rows.map(row => ({
    value: row[0],
    label: row[1]
  }));
};
