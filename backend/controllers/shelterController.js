const Shelter = require("../models/Shelter");

// @desc    Get nearby shelters
// @route   GET /api/shelters/nearby?lat=&lng=&radius=
// @access  Public
const getNearbyShelters = async (req, res, next) => {
    try {
        const { lat, lng, radius = 30 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ message: "lat and lng query params required" });
        }

        const shelters = await Shelter.find({
            isActive: true,
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                    $maxDistance: parseFloat(radius) * 1000,
                },
            },
        }).limit(20);

        res.json(shelters);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all shelters
// @route   GET /api/shelters
// @access  Public
const getAllShelters = async (req, res, next) => {
    try {
        const shelters = await Shelter.find({ isActive: true }).sort({ name: 1 });
        res.json(shelters);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a shelter
// @route   POST /api/shelters
// @access  Private (admin)
const createShelter = async (req, res, next) => {
    try {
        const { name, address, capacity, contact, facilities, location } = req.body;

        let longitude = parseFloat(req.body.lng);
        let latitude = parseFloat(req.body.lat);

        if ((isNaN(longitude) || isNaN(latitude)) && location && Array.isArray(location.coordinates)) {
            longitude = parseFloat(location.coordinates[0]);
            latitude = parseFloat(location.coordinates[1]);
        }

        if (isNaN(longitude)) longitude = 77.209;
        if (isNaN(latitude)) latitude = 28.6139;

        const shelter = await Shelter.create({
            name,
            address,
            location: {
                type: "Point",
                coordinates: [longitude, latitude],
            },
            capacity: Number(capacity) || 100,
            contact: contact || "",
            facilities: facilities || {},
        });

        res.status(201).json(shelter);
    } catch (error) {
        next(error);
    }
};

// @desc    Update shelter (occupancy, status, etc.)
// @route   PATCH /api/shelters/:id
// @access  Private (admin)
const updateShelter = async (req, res, next) => {
    try {
        const shelter = await Shelter.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!shelter) return res.status(404).json({ message: "Shelter not found" });

        res.json(shelter);
    } catch (error) {
        next(error);
    }
};

module.exports = { getNearbyShelters, getAllShelters, createShelter, updateShelter };
