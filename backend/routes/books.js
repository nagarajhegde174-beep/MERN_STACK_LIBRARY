const express = require("express");
const router  = express.Router();
const { booksController } = require("../controller/books");
const { userAuth }  = require("../middlewares/userAuth");
const { checkRole } = require("../middlewares/checkRole");
const { upload }    = require("../utils/cloudConfig");
const { checkRestriction }     = require("../middlewares/checkRestriction");
const { checkAccountValidity } = require("../middlewares/checkAccountValidity");

// Staff: add, delete, update
router.post("/add",       userAuth, checkRole(["admin","librarian"]), upload.single("coverImage"), booksController.addNewBook);
router.delete("/delete/:id", userAuth, checkRole(["admin","librarian"]), booksController.deleteBook);
router.put("/update/:id", userAuth, checkRole(["admin","librarian"]), booksController.updateBook);

// Public / user browsing
router.get("/categories",   booksController.getCategories);
router.get("/search",       booksController.searchBooks);
router.get("/",             booksController.getAllBooks);
router.get("/issuedrequest",booksController.getIssuedRequest);
router.get("/new",          booksController.getLatestBooks);
router.get("/:id",          booksController.getParticularBook);

// User: issued books
router.get("/issued", userAuth, checkRole("user"), booksController.getIssuedBooks);

// User: borrow request — NEW: add validity + restriction check middleware
router.post(
  "/borrow/request-issue/:bookid",
  userAuth,
  checkRole("user"),
  checkAccountValidity,   // ← blocks if account expired
  checkRestriction,       // ← blocks if user has overdue books
  booksController.reqIssueBook,
);

// User: return
router.put("/return/:id",        userAuth, checkRole("user"), booksController.returnBook);
router.put("/returnrequest/:id", userAuth, checkRole("user"), booksController.requestReturnBook);

module.exports = router;
