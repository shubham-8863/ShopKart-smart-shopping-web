/**
 * Middleware to enforce Admin authorization
 * Requires req.user to be populated by authenticateToken
 */
export function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Admin access required.',
  });
}
