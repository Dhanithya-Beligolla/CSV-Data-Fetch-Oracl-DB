import oracledb from "oracledb";
import dotenv from "dotenv";

dotenv.config();

let pool;

export async function init() {
  if (!pool) {
    pool = await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
    });
    console.log("✅ Oracle pool initialized");
  }

  // Ensure table exists
  const conn = await pool.getConnection();
  await conn.execute(`
    BEGIN
      EXECUTE IMMEDIATE '
        CREATE TABLE CMS_CSV_DATA (
          NAME VARCHAR2(100),
          EMPLOYEENUMBER VARCHAR2(50),
          AGE NUMBER,
          DATEOFBIRTH VARCHAR2(20)
        )';
    EXCEPTION
      WHEN OTHERS THEN
        IF SQLCODE != -955 THEN RAISE; END IF; -- ignore "table already exists"
    END;`);
  await conn.close();
}

// Insert CSV rows
export async function insertCSVData(rows) {
  const conn = await pool.getConnection();

  const sql = `
    INSERT INTO CMS_CSV_DATA (NAME, EMPLOYEENUMBER, AGE, DATEOFBIRTH)
    VALUES (:NAME, :EMPLOYEENUMBER, :AGE, :DATEOFBIRTH)
  `;

  await conn.executeMany(sql, rows, { autoCommit: true });
  await conn.close();
}
