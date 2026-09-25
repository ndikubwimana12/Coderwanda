const crypto = require('node:crypto');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const { Transform } = require('node:stream');
const { pipeline } = require('node:stream/promises');
const pool = require('./db');
const { fail } = require('./validation');
const directory = path.join(__dirname, 'learning-media');
const secret = process.env.LEARNING_MEDIA_SECRET || crypto.randomBytes(32).toString('hex');
const signature = value => crypto.createHmac('sha256', secret).update(value).digest('base64url');
function signed(file, userId, unitId = 0) {
  const filename = file.split('/').pop();
  const payload = Buffer.from(JSON.stringify({ filename, userId, unitId, expires: Date.now() + 2 * 60 * 60 * 1000 })).toString('base64url');
  return `/api/learning/media/${filename}?access=${payload}.${signature(payload)}`;
}
function registerMedia(app) {
  // This route precedes bearer middleware: short-lived signatures allow native video range requests.
  app.get('/api/learning/media/:filename', async (req, res) => {
    const [payload, supplied] = String(req.query.access || '').split('.');
    if (!payload || !supplied) fail('Media access expired. Reload the lesson.', 403);
    const expected = signature(payload);
    if (supplied.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) fail('Invalid media access.', 403);
    let claims; try { claims = JSON.parse(Buffer.from(payload, 'base64url').toString()); } catch { fail('Invalid media access.', 403); }
    if (claims.expires < Date.now() || claims.filename !== req.params.filename || !/^[a-f0-9-]+\.(mp4|webm|png|jpg|webp)$/.test(claims.filename)) fail('Media access expired. Reload the lesson.', 403);
    const [[user]] = await pool.query('SELECT u.id,r.admin_access FROM users u JOIN roles r ON r.name=u.role WHERE u.id=? AND u.account_active=1', [claims.userId]);
    if (!user) fail('Media access is unavailable.', 403);
    if (!user.admin_access) {
      const unit = await require('./learning').unitAccess(pool, user, claims.unitId);
      if (![unit.video_url, unit.image_url].includes('/learning-media/' + claims.filename)) fail('Invalid unit media.', 403);
    }
    res.setHeader('Cache-Control', 'private, no-store');
    res.sendFile(claims.filename, { root: directory });
  });
  app.post('/api/admin/learning/media/sign', (req, res) => {
    if (typeof req.body.path !== 'string' || !/^\/learning-media\/[a-f0-9-]+\.(mp4|webm|png|jpg|webp)$/.test(req.body.path)) fail('Invalid media path.');
    res.json({ url: signed(req.body.path, req.user.id) });
  });
  app.post('/api/admin/learning/media', async (req, res) => {
    const mime = String(req.headers['content-type'] || '').split(';')[0];
    const extension = { 'video/mp4': 'mp4', 'video/webm': 'webm', 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }[mime];
    if (!extension) fail('Upload an MP4/WebM video or PNG/JPEG/WebP image.');
    const limit = mime.startsWith('video/') ? 250 * 1024 * 1024 : 5 * 1024 * 1024;
    if (Number(req.headers['content-length']) > limit) fail('This file exceeds the upload size limit.', 413);
    const filename = crypto.randomUUID() + '.' + extension;
    await fsp.mkdir(directory, { recursive: true });
    const destination = path.join(directory, filename); let size = 0; let prefix = Buffer.alloc(0);
    try {
      const validator = new Transform({ transform(chunk, encoding, callback) {
        size += chunk.length;
        if (prefix.length < 16) prefix = Buffer.concat([prefix, chunk.subarray(0, 16 - prefix.length)]);
        if (size > limit) { const error = new Error('This file exceeds the upload size limit.'); error.status = 413; callback(error); } else callback(null, chunk);
      } });
      await pipeline(req, validator, fs.createWriteStream(destination, { flags: 'wx' }));
      const valid = { mp4: prefix.toString('ascii', 4, 8) === 'ftyp', webm: prefix.subarray(0, 4).equals(Buffer.from([26,69,223,163])), png: prefix.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])), jpg: prefix[0] === 255 && prefix[1] === 216 && prefix[2] === 255, webp: prefix.toString('ascii',0,4) === 'RIFF' && prefix.toString('ascii',8,12) === 'WEBP' }[extension];
      if (!size || !valid) fail('The file content does not match the selected media type.');
      res.status(201).json({ path: '/learning-media/' + filename, preview: signed('/learning-media/' + filename, req.user.id), bytes: size });
    } catch (error) { await fsp.unlink(destination).catch(() => {}); throw error; }
  });
}
module.exports = { registerMedia, signed };
