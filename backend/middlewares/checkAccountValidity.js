/**
 * checkAccountValidity.js
 * 
 * Middleware: blocks a user from issuing/requesting books if their
 * library account has expired (accountEndDate has passed).
 * 
 * How to use:  router.post("/borrow", userAuth, checkAccountValidity, checkRestriction, ...)
 */

const { UserModel } = require("../model/UserModel");

const checkAccountValidity = async (req, res, next) => {
  try {
    const userId = req.userInfo?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // If accountEndDate is set and is in the past → account expired
    if (user.accountEndDate && new Date() > new Date(user.accountEndDate)) {
      // Also mark as expired in DB if not already
      if (!user.accountExpired) {
        user.accountExpired = true;
        user.status = "Inactive";
        await user.save();
      }
      return res.status(403).json({
        error: true,
        accountExpired: true,
        message: `Your library account expired on ${new Date(user.accountEndDate).toDateString()}. Please contact the library to renew.`,
      });
    }

    next();
  } catch (err) {
    console.error("checkAccountValidity error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { checkAccountValidity };
