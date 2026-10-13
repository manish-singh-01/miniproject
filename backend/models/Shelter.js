const mongoose = require("mongoose");

const shelterSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Shelter name is required"],
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
            required: true,
        },
        capacity: {
            type: Number,
            required: true,
            min: 0,
        },
        occupancy: {
            type: Number,
            default: 0,
            min: 0,
        },
        contact: {
            type: String,
            default: "",
        },
        facilities: {
            food: { type: Boolean, default: false },
            water: { type: Boolean, default: false },
            medical: { type: Boolean, default: false },
            beds: { type: Boolean, default: false },
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// 2dsphere index for "shelters near me" queries
shelterSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Shelter", shelterSchema);
