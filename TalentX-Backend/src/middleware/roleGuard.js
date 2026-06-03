// src/middleware/roleGuard.js
export function roleGuard(requiredRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      });
    }
    if (!req.user.role) {
      return res.status(403).json({
        error: { code: "ROLE_NOT_SET", message: "User role not set. Call /me/onboard first." },
      });
    }
    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        error: { code: "FORBIDDEN", message: `Requires role: ${requiredRole}` },
      });
    }
    next();
  };
}
