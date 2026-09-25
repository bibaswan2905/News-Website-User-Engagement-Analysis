import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'analytics.db');
const db = new DatabaseSync(dbPath);

// Initialize schema
const schemaPath = path.join(__dirname, 'schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');
db.exec(schemaSql);

export const getDb = () => db;
export { db };

export const queryAll = (sql, params = []) => {
  const stmt = db.prepare(sql);
  return stmt.all(...params);
};

export const queryOne = (sql, params = []) => {
  const stmt = db.prepare(sql);
  return stmt.get(...params);
};

export const runStmt = (sql, params = []) => {
  const stmt = db.prepare(sql);
  return stmt.run(...params);
};

export const execSql = (sql) => {
  return db.exec(sql);
};

export default {
  getDb,
  queryAll,
  queryOne,
  runStmt,
  execSql
};
