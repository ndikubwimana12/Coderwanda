export function getUser() {
  try { const user = JSON.parse(localStorage.getItem('coderwanda_user')); return user && typeof user === 'object' && user.id ? user : null; }
  catch { return null; }
}
export function setSession(user, token) {
  localStorage.setItem('coderwanda_user', JSON.stringify(user));
  localStorage.setItem('coderwanda_token', token);
  window.dispatchEvent(new Event('authChanged'));
}
export function clearSession() {
  localStorage.removeItem('coderwanda_user');
  localStorage.removeItem('coderwanda_token');
  window.dispatchEvent(new Event('authChanged'));
}
export function contentChanged() {
  localStorage.setItem('coderwanda_content_version', String(Date.now()));
  window.dispatchEvent(new Event('contentChanged'));
}
