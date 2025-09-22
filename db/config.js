import dotenv from "dotenv";
import oracledb from "oracledb";

dotenv.config();

let pool;

export async function initialize() {
  if (pool) return pool;
  pool = await oracledb.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING,
    poolMin: 1,
    poolMax: 10,
    poolIncrement: 1,
  });

  // Test connection
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.execute("SELECT 1 FROM dual");
    console.log("Oracle DB connection test successful.");
  } finally {
    if (connection) await connection.close();
  }

  return pool;
}

export async function close() {
  if (pool) {
    await pool.close();
    pool = undefined;
  }
}

export async function execute(sql, binds = {}, opts = {}) {
  let connection;
  try {
    connection = await (pool ? pool.getConnection() : oracledb.getConnection());
    const execOpts = { outFormat: oracledb.OUT_FORMAT_OBJECT, autoCommit: true, ...opts };
    const result = await connection.execute(sql, binds, execOpts);
    return result;
  } catch (err) {
    err.sql = sql;
    err.binds = binds;
    console.error("Oracle execute() error:", err.message);
    throw err;
  } finally {
    if (connection) await connection.close();
  }
}

export { oracledb };
