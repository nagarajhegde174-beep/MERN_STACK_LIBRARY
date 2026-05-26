const express = require("express");
const router  = express.Router();
const { adminController } = require("../controller/admin");
const { userAuth }  = require("../middlewares/userAuth");
const { checkRole } = require("../middlewares/checkRole");
const { upload } = require("../utils/cloudConfig");

const adminOnly = [userAuth, checkRole(["admin"])];
const staffAuth = [userAuth, checkRole(["admin", "librarian"])];

// Auth
router.post("/login", adminController.login);

// Librarian management
router.post("/addlibrarian",        ...adminOnly, upload.single("profilePicture"), adminController.addLibrarian);
router.get("/librarians",           ...adminOnly, adminController.getLibrarians);
router.delete("/librarian/:id",     ...adminOnly, adminController.deleteLibrarian);

// Member management
router.get("/members",                       ...staffAuth, adminController.getMembers);
router.put("/users/:id/toggle",              ...staffAuth, adminController.toggleUserStatus);
router.get("/members/:id/history",           ...staffAuth, adminController.getMemberBorrowHistory);

// NEW: Account validity
router.put("/members/:id/validity",          ...staffAuth, adminController.setAccountValidity);

// Fine configuration
router.get("/fine-config",  ...staffAuth, adminController.getFineConfig);
router.put("/fine-config",  ...staffAuth, adminController.updateFineConfig);

// Dashboard stats
router.get("/dashboard-stats", ...staffAuth, adminController.dashboardStats);

// Fine management
router.delete("/fines/:id/waive", ...adminOnly, adminController.waiveFine);

module.exports = router;
