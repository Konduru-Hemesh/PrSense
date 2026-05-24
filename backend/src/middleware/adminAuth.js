function adminAuth(req, res, next) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return next(); // dev: allow if not configured
  const provided = req.get('x-admin-secret') || req.get('X-Admin-Secret');
  if (!provided || provided !== secret) {
    return res.status(403).json({ error: 'Admin secret required' });
  }
  return next();
}

module.exports = adminAuth;
