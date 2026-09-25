const fs = require('node:fs/promises');
const path = require('node:path');
const pool = require('./db');

async function migrate() {
  const sql = await fs.readFile(path.join(__dirname, 'base-schema.sql'), 'utf8');
  for (const statement of sql.replace(/--[^\n]*/g, '').split(';').map(s => s.trim()).filter(Boolean)) await pool.query(statement);
  await pool.query(`CREATE TABLE IF NOT EXISTS roles (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(50) NOT NULL UNIQUE, description TEXT, admin_access TINYINT NOT NULL DEFAULT 0)`);
  await pool.query(`INSERT IGNORE INTO roles (name, description, admin_access) VALUES ('admin', 'Full control of every dashboard module', 1), ('user', 'Customer and student account', 0)`);
  const [roleColumn] = await pool.query("SHOW COLUMNS FROM users LIKE 'role'");
  if (roleColumn[0].Type.startsWith('enum')) await pool.query("ALTER TABLE users MODIFY role VARCHAR(50) NOT NULL DEFAULT 'user'");
  const additions = { overview: 'TEXT', skills: 'LONGTEXT', projects: 'LONGTEXT', students: 'INT NOT NULL DEFAULT 0' };
  const [columns] = await pool.query('SHOW COLUMNS FROM courses');
  for (const [name, type] of Object.entries(additions)) if (!columns.some(c => c.Field === name)) await pool.query(`ALTER TABLE courses ADD COLUMN \`${name}\` ${type}`);
  await pool.query(`CREATE TABLE IF NOT EXISTS sessions (token_hash CHAR(64) PRIMARY KEY, user_id INT NOT NULL, expires_at DATETIME NOT NULL, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`);
  await pool.query(`CREATE TABLE IF NOT EXISTS site_settings (id INT PRIMARY KEY, data LONGTEXT NOT NULL)`);
  await pool.query(`CREATE TABLE IF NOT EXISTS activity_logs (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NULL, actor VARCHAR(200), action VARCHAR(20) NOT NULL, resource VARCHAR(60) NOT NULL, record_id INT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
  const [userColumns] = await pool.query('SHOW COLUMNS FROM users');
  if (!userColumns.some(column => column.Field === 'account_active')) await pool.query('ALTER TABLE users ADD COLUMN account_active TINYINT NOT NULL DEFAULT 1');
  const learningSQL = await fs.readFile(path.join(__dirname, 'learning-schema.sql'), 'utf8');
  for (const statement of learningSQL.split(';').map(value => value.trim()).filter(Boolean)) await pool.query(statement);
  const practiceSQL = await fs.readFile(path.join(__dirname, 'practice-schema.sql'), 'utf8');
  for (const statement of practiceSQL.split(';').map(value => value.trim()).filter(Boolean)) await pool.query(statement);
  const [practiceColumns] = await pool.query('SHOW COLUMNS FROM coding_exercises');
  if (practiceColumns.find(column => column.Field === 'language').Type.startsWith('enum')) await pool.query('ALTER TABLE coding_exercises MODIFY language VARCHAR(40) NOT NULL');
  if (!practiceColumns.some(column => column.Field === 'language_name')) await pool.query('ALTER TABLE coding_exercises ADD COLUMN language_name VARCHAR(160) NULL');
  await pool.query('DELETE FROM sessions WHERE expires_at < NOW()');
}
module.exports = migrate;
