const express = require("express");
const rateLimit = require("express-rate-limit");
const { protect, authorize, optionalProtect } = require("../middleware/auth");
const {
    createIncident,
    getIncidents,
    getIncident,
    verifyIncident,
    resolveIncident,
    getMyIncidents,
} = require("../controllers/incidentController");

const router = express.Router();

// Rate limit for SOS / incident creation (prevent spam)
const incidentLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10,
    message: { message: "Too many reports submitted, please wait before trying again" },
});

router.get("/mine", protect, getMyIncidents);
router.get("/", optionalProtect, getIncidents);
router.get("/:id", getIncident);
router.post("/", protect, incidentLimiter, createIncident);
router.patch("/:id/verify", protect, authorize("admin"), verifyIncident);
router.patch("/:id/resolve", protect, authorize("admin"), resolveIncident);

module.exports = router;
