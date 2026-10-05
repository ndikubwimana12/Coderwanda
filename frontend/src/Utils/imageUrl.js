/**
 * imageUrl.js
 *
 * Resolves an image path returned by the API into a fully-qualified URL
 * that the browser can load.
 *
 * Problem: Before the upload fix, the server returned relative paths like
 *   /uploads/some-uuid.png
 * The frontend is on coderwanda.net.rw but uploads live on api.coderwanda.net.rw,
 * so the browser would request the wrong origin and get a 404.
 *
 * This function ensures any stored relative /uploads/... path is always
 * prefixed with the correct API base URL.
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Returns a fully-qualified image URL.
 * - If the value is already absolute (http/https) it is returned as-is.
 * - If the value starts with /uploads/ or /learning-media/ it is prefixed
 *   with the API base URL.
 * - Otherwise the value is returned unchanged.
 *
 * @param {string|null|undefined} value - URL as stored in the database.
 * @returns {string}
 */
export function imageUrl(value) {
  if (!value) return '';
  // Already absolute — trust it.
  if (/^https?:\/\//i.test(value)) return value;
  // Relative server-side upload path — prepend the API origin.
  if (value.startsWith('/uploads/') || value.startsWith('/learning-media/')) {
    return `${API_BASE}${value}`;
  }
  return value;
}

export default imageUrl;
