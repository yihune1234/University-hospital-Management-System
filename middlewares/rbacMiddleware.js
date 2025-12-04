// Usage:
// rbac(['Admin', 'Doctor'])
// rbac('Admin')
// rbac({ minLevel: 60 })

module.exports = function rbac(required) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // ----------------------------------------
    // 1. Role-based access (string or array)
    // ----------------------------------------
    if (typeof required === 'string') {
      if (user.role_name === required) {
        return next();
      }
      return res.status(403).json({ error: 'Forbidden - role not allowed' });
    }

    if (Array.isArray(required)) {
      if (required.includes(user.role_name)) {
        return next();
      }
      return res
        .status(403)
        .json({ error: 'Forbidden - insufficient role' });
    }

    // ----------------------------------------
    // 2. Permission-level access
    // ----------------------------------------
    if (required && typeof required === 'object' && typeof required.minLevel === 'number') {
      if (user.permission_level >= required.minLevel) {
        return next();
      }
      return res
        .status(403)
        .json({ error: 'Forbidden - insufficient permission level' });
    }

    // ----------------------------------------
    // 3. If config is unknown → block by default
    // ----------------------------------------
    if (required !== undefined) {
      return res.status(400).json({
        error: 'RBAC configuration invalid'
      });
    }

    // ----------------------------------------
    // 4. Default → user is authenticated
    // ----------------------------------------
    next();
  };
};
