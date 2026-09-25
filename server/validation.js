const resources = require('./resources');
function fail(message, status = 400) { const error = new Error(message); error.status = status; throw error; }
function positiveId(value) { const id = Number(value); if (!Number.isSafeInteger(id) || id <= 0) fail('Invalid record ID.'); return id; }
function validate(resource, body, editing = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) fail('A JSON object is required.');
  const result = {};
  for (const [key, field] of Object.entries(resources[resource].fields)) {
    if (field.type === 'items') continue;
    let value = body[key] ?? field.default ?? '';
    if (field.type === 'password' && !value && editing) continue;
    if (field.required && (value === '' || value === null)) fail(`${field.label} is required.`);
    if (field.type === 'number' || field.type === 'relation') {
      if (value === '') value = ['user_id', 'old_price'].includes(key) ? null : 0;
      else { value = Number(value); if (!Number.isSafeInteger(value) || value < (field.min || 0) || value > (field.max || 2147483647)) fail(`${field.label} must be a valid non-negative whole number.`); }
      if (field.type === 'relation') positiveId(value);
    } else if (field.type === 'list') {
      value = Array.isArray(value) ? value : String(value).split('\n');
      if (value.some(v => typeof v !== 'string')) fail(`${field.label} must contain text.`);
      value = JSON.stringify(value.map(v => v.trim()).filter(Boolean));
    } else {
      if (typeof value !== 'string' && typeof value !== 'number') fail(`${field.label} must be text.`);
      value = field.type === 'password' ? String(value) : String(value).trim();
      if (field.required && !value) fail(`${field.label} is required.`);
      if (value.length > (['textarea', 'image'].includes(field.type) ? 60000 : 200)) fail(`${field.label} is too long.`);
      if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) fail('Enter a valid email address.');
      if (field.type === 'email') value = value.toLowerCase();
      if (field.type === 'password' && (value.length < 8 || Buffer.byteLength(value, 'utf8') > 72)) fail('Password must have at least 8 characters and at most 72 UTF-8 bytes.');
      if (field.options && !field.options.includes(value)) fail(`Invalid ${field.label.toLowerCase()}.`);
      if (['url', 'image'].includes(field.type) && value && !/^https?:\/\/[^\s]+$/i.test(value) && !(field.type === 'image' && /^\/uploads\/[\w.-]+$/.test(value))) fail(`${field.label} must be an HTTP(S) URL or an uploaded image.`);
      if (key === 'slug' && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) fail('Use lowercase letters, numbers and hyphens for the slug.');
      if (resource === 'roles' && key === 'name' && !/^[a-z][a-z0-9_-]{0,49}$/.test(value)) fail('Role names must be lowercase identifiers.');
    }
    result[key] = value;
  }
  return result;
}
function format(resource, row) {
  const result = { ...row };
  delete result.password;
  for (const [key, field] of Object.entries(resources[resource].fields)) if (field.type === 'list') {
    try { result[key] = JSON.parse(row[key] || '[]'); } catch { result[key] = String(row[key] || '').split(key === 'responsibilities' ? /\n|\\n/ : /,|\n/).map(v => v.trim()).filter(Boolean); }
    if (!Array.isArray(result[key])) result[key] = [];
  }
  return result;
}
module.exports = { fail, positiveId, validate, format };
