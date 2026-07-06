export const isAdmin = (req, res, next) => {
    if (req.user?.role !== "ICT_ADMIN") {
        return res.status(403).json({ message: "Access Denied: Admins only" });
    }
    next();
};
//# sourceMappingURL=admin.midlleware.js.map