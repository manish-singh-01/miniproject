const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Alert title is required"],
            trim: true,
        },
        message: {
            type: String,
            required: [true, "Alert message is required"],
        },
        type: {
            type: String,
            enum: ["flood", "earthquake", "cyclone", "fire", "landslide", "general"],
            default: "general",
        },
        severity: {
            type: String,
            enum: ["low", "medium", "high"],
            required: true,
        },
        // GeoJSON polygon defining the affected zone
        zone: {
            type: {
                type: String,
                enum: ["Polygon"],
            },
            coordinates: {
                type: [[[Number]]], // array of rings of [lng, lat] pairs
            },
        },
        affectedArea: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: ["draft", "pending", "sent"],
            default: "draft",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        sentAt: Date,
        emailsSent: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// 2dsphere index for zone-based queries
alertSchema.index({ zone: "2dsphere" });

module.exports = mongoose.model("Alert", alertSchema);
