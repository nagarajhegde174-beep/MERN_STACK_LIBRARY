const express = require("express");
const router  = express.Router();
const { checkRole } = require("../middlewares/checkRole");
const { userAuth }  = require("../middlewares/userAuth");
const { checkRestriction }    = require("../middlewares/checkRestriction");
const { checkAccountValidity } = require("../middlewares/checkAccountValidity");
const { userController } = require("../controller/user");
const { upload } = require("../utils/cloudConfig");

router.get("/",                userController.getUsers);
router.post("/register",       upload.single("profilePicture"), userController.userRegistration);
router.post("/login",          userController.login);

// Profile
router.get("/profile",   userAuth, checkRole(["user","admin","librarian"]), userController.profile);
router.put("/profile",   userAuth, checkRole(["user","admin","librarian"]), userController.updateProfile);

// Contact
router.post("/contact", userController.addContact);

// Password reset
router.post("/forgot-password",  userController.forgotPassword);
router.post("/verify-otp",       userController.verifyOTP);
router.post("/reset-password",   userController.resetPassword);

// ── NEW: My borrows + return request ─────────────────────────────────────────
router.get("/myborrows",           userAuth, checkRole(["user"]), userController.myBorrows);
router.put("/returnrequest/:id",   userAuth, checkRole(["user"]), userController.requestReturn);

module.exports = router;
