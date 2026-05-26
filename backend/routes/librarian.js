const express = require("express");
const router  = express.Router();
const { librarianController } = require("../controller/librarian");
const { userAuth }  = require("../middlewares/userAuth");
const { checkRole } = require("../middlewares/checkRole");

const staff = [userAuth, checkRole(["admin","librarian"])];

// Issued books (view only)
router.get("/bookissued",                  ...staff, librarianController.bookIssued);

// Pending issue requests (view, approve, reject)
router.get("/issuerequest",                ...staff, librarianController.issueRequest);
router.put("/approverequest/:id",          ...staff, librarianController.approveRequest);   // body: { dueDate }
router.put("/rejectrequest/:id",           ...staff, librarianController.rejectRequest);    // body: { reason }

// Return flow
router.get("/returnrequest",               ...staff, librarianController.returnRequest);
router.put("/approvereturnrequest/:id",    ...staff, librarianController.approveReturnRequest);
router.put("/rejectreturnrequest/:id",     ...staff, librarianController.rejectReturnRequest);
router.put("/directreturn/:id",            ...staff, librarianController.directReturn);

module.exports = router;
