const Incident = require("../models/Incident");
const AuditLog = require("../models/AuditLog");

// @desc    Create a new incident report
// @route   POST /api/incidents
// @access  Private (citizen, responder, admin)
const createIncident = async (req, res, next) => {
    try {
        const { type, severity, description, lat, lng, address } = req.body;

        if (!lat || !lng) {
            return res.status(400).json({ message: "Location coordinates are required" });
        }

        const incident = await Incident.create({
            type,
            severity,
            description,
            address,
            location: {
                type: "Point",
                coordinates: [parseFloat(lng), parseFloat(lat)],
            },
            reportedBy: req.user._id,
            status: "unverified",
        });

        const io = req.app.get("io");
        if (io) {
            io.emit("incident:reported", {
                incidentId: incident._id,
                type: incident.type,
                severity: incident.severity,
                address: incident.address,
                location: incident.location,
            });
        }

        res.status(201).json(incident);
    } catch (error) {
        next(error);
    }
};

// @desc    Get incidents (with optional geo filter)
// @route   GET /api/incidents?lat=&lng=&radius=&status=
// @access  Public (only verified) / Private admin (all)
const getIncidents = async (req, res, next) => {
    try {
        const { lat, lng, radius = 50, status } = req.query;

        let query = {};

        // Non-admins and non-responders only see verified incidents
        if (!req.user || (req.user.role !== "admin" && req.user.role !== "responder")) {
            query.status = "verified";
        } else if (status && status !== "all") {
            query.status = status;
        }

        // Geo query if lat/lng provided
        if (lat && lng) {
            query.location = {
                $near: {
                    $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                    $maxDistance: parseFloat(radius) * 1000, // km to metres
                },
            };
        }

        const incidents = await Incident.find(query)
            .populate("reportedBy", "name email")
            .populate("verifiedBy", "name")
            .sort({ createdAt: -1 })
            .limit(100);

        res.json(incidents);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single incident
// @route   GET /api/incidents/:id
// @access  Public
const getIncident = async (req, res, next) => {
    try {
        const incident = await Incident.findById(req.params.id)
            .populate("reportedBy", "name email")
            .populate("verifiedBy", "name");

        if (!incident) {
            return res.status(404).json({ message: "Incident not found" });
        }

        res.json(incident);
    } catch (error) {
        next(error);
    }
};

// @desc    Verify an incident (admin only)
// @route   PATCH /api/incidents/:id/verify
// @access  Private (admin)
const verifyIncident = async (req, res, next) => {
    try {
        const incident = await Incident.findById(req.params.id);

        if (!incident) {
            return res.status(404).json({ message: "Incident not found" });
        }

        incident.status = "verified";
        incident.verifiedBy = req.user._id;
        incident.verifiedAt = new Date();
        await incident.save();

        // Audit log
        await AuditLog.create({
            actor: req.user._id,
            actorName: req.user.name,
            action: "VERIFY_INCIDENT",
            target: `Incident:${incident._id}`,
            details: `Verified ${incident.type} incident`,
            ip: req.ip,
        });

        // Emit real-time update via Socket.io (attached to req.app)
        const io = req.app.get("io");
        if (io) {
            io.emit("incident:verified", {
                incidentId: incident._id,
                type: incident.type,
                severity: incident.severity,
                location: incident.location,
            });
        }

        res.json(incident);
    } catch (error) {
        next(error);
    }
};

// @desc    Resolve an incident (admin only)
// @route   PATCH /api/incidents/:id/resolve
// @access  Private (admin)
const resolveIncident = async (req, res, next) => {
    try {
        const incident = await Incident.findById(req.params.id);
        if (!incident) return res.status(404).json({ message: "Incident not found" });

        incident.status = "resolved";
        incident.resolvedAt = new Date();
        await incident.save();

        await AuditLog.create({
            actor: req.user._id,
            actorName: req.user.name,
            action: "RESOLVE_INCIDENT",
            target: `Incident:${incident._id}`,
            ip: req.ip,
        });

        res.json(incident);
    } catch (error) {
        next(error);
    }
};

// @desc    Get my incidents (citizen)
// @route   GET /api/incidents/mine
// @access  Private
const getMyIncidents = async (req, res, next) => {
    try {
        const incidents = await Incident.find({ reportedBy: req.user._id }).sort({ createdAt: -1 });
        res.json(incidents);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createIncident,
    getIncidents,
    getIncident,
    verifyIncident,
    resolveIncident,
    getMyIncidents,
};
