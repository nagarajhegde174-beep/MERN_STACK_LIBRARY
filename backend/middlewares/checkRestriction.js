/**
 * checkRestriction.js
 * 
 * Middleware: blocks a user from making new borrow requests or issues
 * if they have overdue books (isRestricted = true).
 * 
 * How to use:  router.post("/borrow", userAuth, checkRestriction, ...)
 */

const { UserModel } = require("../model/UserModel");

const checkRestriction = async (req, res, next) => {
  try {
    const userId = req.userInfo?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isRestricted) {
      return res.status(403).json({
        error: true,
        restricted: true,
        message: `Your account is restricted due to overdue book(s). Please return all overdue books before making new requests.`,
        reason: user.restrictionReason,
      });
    }

    const { FineModel } = require("../model/FineModel");
    const unpaidFines = await FineModel.findOne({ memberId: userId, paidStatus: false });
    
    if (unpaidFines) {
      return res.status(403).json({
        error: true,
        restricted: true,
        message: `You must clear pending fines before borrowing more books.`,
        reason: "Unpaid fines",
      });
    }

    next();
  } catch (err) {
    console.error("checkRestriction error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { checkRestriction };
