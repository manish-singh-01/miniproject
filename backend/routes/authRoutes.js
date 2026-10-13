const express = require("express");
const rateLimit = require("express-rate-limit");
const { register, login, getMe, updateLocation, getResponders } = require("../controllers/authController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Rate limit on auth routes (prevent brute force)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: { message: "Too many attempts, please try again later" },
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/me", protect, getMe);
router.put("/location", protect, updateLocation);
router.get("/responders", protect, authorize("admin"), getResponders);

module.exports = router;
