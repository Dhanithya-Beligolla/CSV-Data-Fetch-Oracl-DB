import { execute, initialize } from "../db/config.js";

const TABLE_NAME = "CMS_CSV_DATA";

// Ensure table exists
export async function init() {
  await initialize();

  const check = await execute(
    `SELECT table_name FROM user_tables WHERE table_name = :tn`,
    { tn: TABLE_NAME }
  );

  if (!check.rows || check.rows.length === 0) {
    await execute(`
      CREATE TABLE ${TABLE_NAME} (
        id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name VARCHAR2(100),
        employNumber VARCHAR2(50),
        age NUMBER,
        dateOfBirth VARCHAR2(50)
      )
    `);
    console.log(`Created table '${TABLE_NAME}' in Oracle DB.`);
  }
}

// Insert CSV rows
export async function insertCSVData(rows) {
  for (const row of rows) {
    await execute(
      `INSERT INTO ${TABLE_NAME} (name, employNumber, age, dateOfBirth)
       VALUES (:name, :employNumber, :age, :dateOfBirth)`,
      row
    );
  }
}

// List all rows
export async function listCSVData() {
  const res = await execute(`SELECT * FROM ${TABLE_NAME} ORDER BY id DESC`);
  return res.rows || [];
}
