const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
    {
        actor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        actorName: String,
        action: {
            type: String,
            required: true,
            // e.g. "VERIFY_INCIDENT", "SEND_ALERT", "ASSIGN_TASK", "REGISTER"
        },
        target: {
            type: String, // e.g. "Incident:6abc...", "Alert:7xyz..."
            default: "",
        },
        details: {
            type: String,
            default: "",
        },
        ip: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
