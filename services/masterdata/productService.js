import { execute } from '../../db/config.js';
import oracledb from 'oracledb';

const defaultSelectOptions = { outFormat: oracledb.OUT_FORMAT_ARRAY };

// Create Product
export const createProduct = async (productData) => {
  const query = `
    INSERT INTO PRODUCTS (
      productId, productName, isActive, createdOn, modifiedOn
    )
    VALUES (
      :productId, :productName, :isActive, SYSDATE, SYSDATE
    )
    RETURNING productId, productName, isActive, createdOn, modifiedOn
    INTO :outProductId, :outProductName, :outIsActive, :outCreatedOn, :outModifiedOn
  `;
  const binds = {
    productId: productData.productId || null,
    productName: productData.productName,
    isActive: productData.isActive !== undefined ? (productData.isActive ? 1 : 0) : 1,
    outProductId: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
    outProductName: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
    outIsActive: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    outCreatedOn: { dir: oracledb.BIND_OUT, type: oracledb.DATE },
    outModifiedOn: { dir: oracledb.BIND_OUT, type: oracledb.DATE }
  };
  const result = await execute(query, binds);
  return {
    productId: Array.isArray(result.outBinds.outProductId) ? result.outBinds.outProductId[0] : result.outBinds.outProductId,
    productName: Array.isArray(result.outBinds.outProductName) ? result.outBinds.outProductName[0] : result.outBinds.outProductName,
    isActive: (Array.isArray(result.outBinds.outIsActive) ? result.outBinds.outIsActive[0] : result.outBinds.outIsActive) === 1,
    createdOn: Array.isArray(result.outBinds.outCreatedOn) ? result.outBinds.outCreatedOn[0] : result.outBinds.outCreatedOn,
    modifiedOn: Array.isArray(result.outBinds.outModifiedOn) ? result.outBinds.outModifiedOn[0] : result.outBinds.outModifiedOn
  };
};

// Get Product by ID
export const getProductById = async (productId) => {
  const query = `
    SELECT productId, productName, isActive, createdOn, modifiedOn
    FROM PRODUCTS
    WHERE productId = :productId
  `;
  const result = await execute(query, { productId }, defaultSelectOptions);
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    productId: row[0],
    productName: row[1],
    isActive: row[2] === 1,
    createdOn: row[3],
    modifiedOn: row[4]
  };
};

// Get all Products
export const getAllProducts = async () => {
  const query = `
    SELECT productId, productName, isActive, createdOn, modifiedOn
    FROM PRODUCTS
    ORDER BY productId
  `;
  const result = await execute(query, {}, defaultSelectOptions);
  return result.rows.map(row => ({
    productId: row[0],
    productName: row[1],
    isActive: row[2] === 1,
    createdOn: row[3],
    modifiedOn: row[4]
  }));
};

// Update Product
export const updateProduct = async (productId, productData) => {
  const query = `
    UPDATE PRODUCTS
    SET productName = :productName,
        isActive = :isActive,
        modifiedOn = SYSDATE
    WHERE productId = :productId
    RETURNING productId, productName, isActive, createdOn, modifiedOn
    INTO :outProductId, :outProductName, :outIsActive, :outCreatedOn, :outModifiedOn
  `;
  const binds = {
    productId,
    productName: productData.productName,
    isActive: productData.isActive !== undefined ? (productData.isActive ? 1 : 0) : 1,
    outProductId: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
    outProductName: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
    outIsActive: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    outCreatedOn: { dir: oracledb.BIND_OUT, type: oracledb.DATE },
    outModifiedOn: { dir: oracledb.BIND_OUT, type: oracledb.DATE }
  };
  const result = await execute(query, binds);
  if (result.rowsAffected === 0) return null;
  return {
    productId: Array.isArray(result.outBinds.outProductId) ? result.outBinds.outProductId[0] : result.outBinds.outProductId,
    productName: Array.isArray(result.outBinds.outProductName) ? result.outBinds.outProductName[0] : result.outBinds.outProductName,
    isActive: (Array.isArray(result.outBinds.outIsActive) ? result.outBinds.outIsActive[0] : result.outBinds.outIsActive) === 1,
    createdOn: Array.isArray(result.outBinds.outCreatedOn) ? result.outBinds.outCreatedOn[0] : result.outBinds.outCreatedOn,
    modifiedOn: Array.isArray(result.outBinds.outModifiedOn) ? result.outBinds.outModifiedOn[0] : result.outBinds.outModifiedOn
  };
};

// Delete Product
export const deleteProduct = async (productId) => {
  const query = `DELETE FROM PRODUCTS WHERE productId = :productId`;
  const result = await execute(query, { productId });
  return result.rowsAffected > 0;
};

// Products for dropdown
export const getProductsForDropdown = async () => {
  const query = `
    SELECT productId, productName
    FROM PRODUCTS
    WHERE isActive = 1
    ORDER BY productName
  `;
  const result = await execute(query, {}, defaultSelectOptions);
  return result.rows.map(row => ({
    value: row[0],
    label: row[1]
  }));
};
