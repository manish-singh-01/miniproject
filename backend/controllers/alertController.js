const Alert = require("../models/Alert");
const AuditLog = require("../models/AuditLog");

// @desc    Create a new alert (draft)
// @route   POST /api/alerts
// @access  Private (admin)
const createAlert = async (req, res, next) => {
    try {
        const { title, message, type, severity, affectedArea, zone } = req.body;

        const alert = await Alert.create({
            title,
            message,
            type: type || "general",
            severity,
            affectedArea,
            zone: zone || undefined,
            createdBy: req.user._id,
            status: "draft",
        });

        res.status(201).json(alert);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all active (sent) alerts
// @route   GET /api/alerts/active
// @access  Public
const getActiveAlerts = async (req, res, next) => {
    try {
        const alerts = await Alert.find({ status: "sent" })
            .populate("createdBy", "name")
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(alerts);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all alerts (admin)
// @route   GET /api/alerts
// @access  Private (admin)
const getAllAlerts = async (req, res, next) => {
    try {
        const alerts = await Alert.find()
            .populate("createdBy", "name")
            .sort({ createdAt: -1 });

        res.json(alerts);
    } catch (error) {
        next(error);
    }
};

// @desc    Send an alert (changes status to pending → cron picks it up)
// @route   PATCH /api/alerts/:id/send
// @access  Private (admin)
const sendAlert = async (req, res, next) => {
    try {
        const alert = await Alert.findById(req.params.id);
        if (!alert) return res.status(404).json({ message: "Alert not found" });

        alert.status = "pending";
        await alert.save();

        // Emit immediately via Socket.io
        const io = req.app.get("io");
        if (io) {
            io.emit("alert:new", {
                _id: alert._id,
                title: alert.title,
                message: alert.message,
                severity: alert.severity,
                type: alert.type,
                affectedArea: alert.affectedArea,
                createdAt: alert.createdAt,
            });
        }

        await AuditLog.create({
            actor: req.user._id,
            actorName: req.user.name,
            action: "SEND_ALERT",
            target: `Alert:${alert._id}`,
            details: `Alert "${alert.title}" queued for sending`,
            ip: req.ip,
        });

        res.json({ message: "Alert queued for sending", alert });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete an alert (admin)
// @route   DELETE /api/alerts/:id
// @access  Private (admin)
const deleteAlert = async (req, res, next) => {
    try {
        const alert = await Alert.findByIdAndDelete(req.params.id);
        if (!alert) return res.status(404).json({ message: "Alert not found" });
        res.json({ message: "Alert deleted" });
    } catch (error) {
        next(error);
    }
};

module.exports = { createAlert, getActiveAlerts, getAllAlerts, sendAlert, deleteAlert };
