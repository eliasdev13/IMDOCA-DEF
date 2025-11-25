module.exports.checkRole = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user.uid; // viene del payload del JWT
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ message: "No tienes permisos para esta acción" });
        }
        next();
    };
};
