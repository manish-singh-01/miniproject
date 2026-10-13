const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        incidentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Incident",
            required: true,
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: ["assigned", "en_route", "on_site", "done"],
            default: "assigned",
        },
        notes: {
            type: String,
            default: "",
        },
        // Timestamps for each status transition
        enRouteAt: Date,
        onSiteAt: Date,
        doneAt: Date,
    },
    { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
