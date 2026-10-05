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

const configuredApiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const hostedApiOrigin = typeof window !== 'undefined' &&
  ['coderwanda.net.rw', 'www.coderwanda.net.rw'].includes(window.location.hostname)
  ? 'https://api.coderwanda.net.rw'
  : '';
const API_BASE = configuredApiUrl.startsWith('/')
  ? hostedApiOrigin
  : (configuredApiUrl || hostedApiOrigin).replace(/\/api$/i, '');

// When the frontend and Node app share a Namecheap domain, Apache may serve
// the files directly from the account's server/uploads folder. This override
// is optional; set VITE_UPLOADS_URL to the public URL mapped to that folder.
const UPLOADS_BASE = (import.meta.env.VITE_UPLOADS_URL || API_BASE).replace(/\/$/, '');
const uploadedFilename = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.(?:png|jpe?g|webp)$/i;

function uploadedPath(pathname) {
  const normalized = pathname.replace(/\\/g, '/');
  const name = normalized.split('/').pop();
  if (!uploadedFilename.test(name || '')) return null;
  // Older admin records may contain only the generated filename, or a path
  // relative to the project root, instead of the canonical /uploads URL.
  return `/uploads/${name}`;
}

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
  const path = value.trim();
  if (!path) return '';

  // Uploads stored by older deployments may be absolute URLs pointing to an
  // API hostname that has since changed. Use the configured API origin when
  // available, otherwise keep the absolute URL as supplied.
  if (/^https?:\/\//i.test(path)) {
    try {
      const url = new URL(path);
      // Signed learning URLs include an API route and query-string grant;
      // keep them pointed at the API and preserve the signature byte for byte.
      if (url.pathname.startsWith('/api/learning/media/') || url.pathname.startsWith('/learning-media/')) return path;
      const uploadPath = url.pathname.startsWith('/uploads/') ? url.pathname : uploadedPath(url.pathname);
      if (uploadPath) return `${UPLOADS_BASE}${uploadPath}${url.search}${url.hash}`;
    } catch {
      return path;
    }
    return path;
  }

  // Relative server-side paths belong to the API when it has its own origin.
  if (path.startsWith('/api/learning/media/')) return `${API_BASE}${path}`;
  if (path.startsWith('/learning-media/')) return `${API_BASE}${path}`;
  const uploadPath = path.startsWith('/uploads/')
    ? path
    : uploadedPath(path.replace(/^\.\//, ''));
  if (uploadPath) return `${UPLOADS_BASE}${uploadPath}`;
  return path;
}

export default imageUrl;
