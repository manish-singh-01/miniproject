const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: [true, "Incident type is required"],
            enum: ["flood", "earthquake", "cyclone", "fire", "landslide", "other"],
        },
        severity: {
            type: String,
            enum: ["low", "medium", "high"],
            required: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
        },
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true,
            },
        },
        address: {
            type: String,
            default: "",
        },
        photos: [
            {
                filename: String,
                contentType: String,
                fileId: mongoose.Schema.Types.ObjectId, // GridFS file ID
            },
        ],
        status: {
            type: String,
            enum: ["unverified", "verified", "resolved"],
            default: "unverified",
        },
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        verifiedAt: Date,
        resolvedAt: Date,
    },
    { timestamps: true }
);

// 2dsphere index for geo queries ("incidents within X km")
incidentSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Incident", incidentSchema);
