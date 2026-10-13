const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
    createAlert,
    getActiveAlerts,
    getAllAlerts,
    sendAlert,
    deleteAlert,
} = require("../controllers/alertController");

const router = express.Router();

router.get("/active", getActiveAlerts);
router.get("/", protect, authorize("admin"), getAllAlerts);
router.post("/", protect, authorize("admin"), createAlert);
router.patch("/:id/send", protect, authorize("admin"), sendAlert);
router.delete("/:id", protect, authorize("admin"), deleteAlert);

module.exports = router;
