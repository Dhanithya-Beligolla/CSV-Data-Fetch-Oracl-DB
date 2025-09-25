import oracledb from "oracledb";
import dotenv from "dotenv";

dotenv.config();

let pool;

export const COLUMNS = [
  'cr1f8_acceptedby',
  'cr1f9_acceptedby',
  'cr1f8_activestatus',
  'cr1f8_attachments',
  'cr1f8_claimingstatus',
  'cr1f8_closingattachment',
  'cr1f8_closingcomment',
  'cr1f8_communication_method',
  'cr1f8_complainrefno',
  'cr1f8_complaintstatus',
  'cr1f8_complaint_description',
  'cr1f8_complaintsid',
  'cr1f8_mobile_no',
  'cr1f8_name',
  'cr1f8_email',
  'cr1f8_expireon',
  'cr1f8_id',
  'importsequencenumber',
  'cr1f8_new_customer',
  'cr1f8_nic',
  'cr1f8_pinnacle',
  'cr1f8_reopenedby',
  'cr1f8_reopenedon',
  'cr1f8_reopenedstatus',
  'cr1f8_reopenedto',
  'cr1f8_reopeningcomment',
  'cr1f8_slaexpiredate',
  'cr1f8_sla_breached_noofworkingdays',
  'cr1f8_sla_expireon',
  'cr1f8_sla',
  'cr1f8_slabreachednoofworkingdays',
  'statuscode',
  'statecode',
  'cr1f8_sysemail',
  'cr1f8_ticketclosedby',
  'cr1f8_ticketclosedon',
  'cr1f8_channel',
  'cr1f8_complain_title',
  'timezoneruleversionnumber',
  'utcconversiontimezonecode',
  'versionnumber',
  'cr1f8_branch',
  'cr1f8_category',
  'cr1f8_complaint_titles',
  'cr1f8_departmentemail',
  'cr1f8_departments',
  'owningbusinessunit',
  'cr1f8_product',
  'cr1f8_sla_days',
  'cr1f8_closedby_azureactivedirectoryobjectid'
];

// Choose which columns truly need CLOB (very long free-text) vs VARCHAR2
// Key column must NOT be CLOB because Oracle cannot use '=' with CLOB without functions.
const KEY_COLUMN = 'cr1f8_complainrefno';
const LONG_TEXT_COLUMNS = new Set([
  'cr1f8_closingcomment',
  'cr1f8_complaint_description',
  'cr1f8_reopeningcomment'
]);
const COLUMN_TYPES = {};
COLUMNS.forEach(c => {
  if (c === KEY_COLUMN) {
    COLUMN_TYPES[c] = 'VARCHAR2(1000)'; // adjust length if necessary
  } else if (LONG_TEXT_COLUMNS.has(c)) {
    COLUMN_TYPES[c] = 'CLOB';
  } else {
    COLUMN_TYPES[c] = 'VARCHAR2(4000)';
  }
});

export async function init() {
  // Ensure CLOBs come back as strings to avoid circular JSON / streaming LOB objects
  oracledb.fetchAsString = [ oracledb.CLOB ];
  if (!pool) {
    pool = await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
    });
    console.log("✅ Oracle pool initialized");
  }

  const conn = await pool.getConnection();
  try {
    if (process.env.FORCE_RECREATE_TABLE === 'true') {
      await conn.execute(`
        BEGIN
          EXECUTE IMMEDIATE 'DROP TABLE CMS_DATA PURGE';
        EXCEPTION
          WHEN OTHERS THEN
            IF SQLCODE != -942 THEN RAISE; END IF;
        END;`);
      console.log("♻️ Dropped existing CMS_DATA");
    }

    const columnDefs = COLUMNS
      .map(col => `${col} ${COLUMN_TYPES[col]}`)
      .join(',\n          ');
    const createSql = `CREATE TABLE CMS_DATA (\n          ${columnDefs}\n        )`;

    await conn.execute(`
      BEGIN
        EXECUTE IMMEDIATE '${createSql.replace(/'/g, "''")}';
      EXCEPTION
        WHEN OTHERS THEN
          IF SQLCODE != -955 THEN RAISE; END IF;
      END;`);
  } finally {
    await conn.close();
  }
}

function sanitizeRow(row) {
  const sanitized = {};
  for (const c of COLUMNS) {
    let v = row[c];
    if (v === undefined || v === '') v = null;
    sanitized[c] = v;
  }
  return sanitized;
}

// Insert CSV rows - rows should be array of objects whose keys match COLUMNS
export async function insertCSVData(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return;
  const conn = await pool.getConnection();
  try {
    const colList = COLUMNS.join(', ');
    const bindNames = COLUMNS.map(c => `:${c}`).join(', ');
    const sql = `INSERT INTO CMS_DATA (${colList}) VALUES (${bindNames})`;

    const binds = rows.map(r => sanitizeRow(r));

    try {
      await conn.executeMany(sql, binds, { autoCommit: true });
    } catch (err) {
      if (err && err.errorNum === 12899) {
        console.error('❌ ORA-12899 still occurred even with CLOB columns. Check if table was recreated. Set FORCE_RECREATE_TABLE=true and restart to drop & recreate.');
      }
      throw err;
    }
  } finally {
    await conn.close();
  }
}

// List all data
export async function listCSVData() {
  const conn = await pool.getConnection();
  try {
    const colList = COLUMNS.join(', ');
    const result = await conn.execute(
      `SELECT ${colList} FROM CMS_DATA`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const rows = result.rows || [];
    // Defensive: ensure no Lob objects remain
    return rows.map(r => {
      const clean = {};
      for (const k in r) {
        const v = r[k];
        if (v && typeof v === 'object' && v.iLob) {
          // Should not happen with fetchAsString, but safeguard
          clean[k] = String(v);
        } else {
          clean[k] = v;
        }
      }
      return clean;
    });
  } finally {
    await conn.close();
  }
}

// Update by CR1F8_COMPLAINREFNO (case-insensitive key provided as parameter)
export async function updateByComplainRef(refNo, fields) {
  if (!refNo) throw new Error('refNo required');
  if (!fields || typeof fields !== 'object') throw new Error('fields object required');

  // Normalize provided field names to actual column names
  const changes = [];
  for (const k of Object.keys(fields)) {
    if (k.toLowerCase() === 'cr1f8_complainrefno') continue; // don't allow changing key
    const col = COLUMNS.find(c => c.toLowerCase() === k.toLowerCase());
    if (col) {
      changes.push({ col, value: fields[k] });
    }
  }
  if (changes.length === 0) return { rowsAffected: 0, message: 'No valid columns to update' };

  const setClause = changes.map((c, i) => `${c.col} = :v${i}`).join(', ');
  const binds = { refNo };
  changes.forEach((c, i) => { binds[`v${i}`] = c.value; });

  const conn = await pool.getConnection();
  try {
    // Determine datatype of key column (in case table existed from old schema as CLOB)
    const dtRes = await conn.execute(
      `SELECT DATA_TYPE FROM USER_TAB_COLUMNS WHERE TABLE_NAME = 'CMS_DATA' AND COLUMN_NAME = :col`,
      { col: KEY_COLUMN.toUpperCase() }
    );
    const dataType = dtRes.rows?.[0]?.[0];
    let sql;
    if (dataType === 'CLOB') {
      // Use DBMS_LOB.COMPARE for CLOB equality (returns 0 when equal)
      sql = `UPDATE CMS_DATA SET ${setClause} WHERE DBMS_LOB.COMPARE(${KEY_COLUMN}, :refNo) = 0`;
      // For CLOB compare we need refNo as a temporary CLOB; oracle driver will bind string -> CLOB
    } else {
      sql = `UPDATE CMS_DATA SET ${setClause} WHERE ${KEY_COLUMN} = :refNo`;
    }
    const result = await conn.execute(sql, binds, { autoCommit: true });
    return { rowsAffected: result.rowsAffected || 0, keyType: dataType };
  } finally {
    await conn.close();
  }
}