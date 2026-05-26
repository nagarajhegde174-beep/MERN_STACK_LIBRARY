const express = require("express");
const router  = express.Router();
const { reportController } = require("../controller/reportController");
const { userAuth }  = require("../middlewares/userAuth");
const { checkRole } = require("../middlewares/checkRole");

// Only admin and librarian can download the report
router.get("/overdue-pdf", userAuth, checkRole(["admin","librarian"]), reportController.generateOverdueReport);

module.exports = router;
