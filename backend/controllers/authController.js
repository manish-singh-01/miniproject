const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
    try {
        const { name, email, password, role, phone } = req.body;

        // Only allow citizen and responder self-registration
        const allowedRoles = ["citizen", "responder"];
        const userRole = allowedRoles.includes(role) ? role : "citizen";

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const user = await User.create({ name, email, password, role: userRole, phone });

        // Audit log
        await AuditLog.create({
            actor: user._id,
            actorName: user.name,
            action: "REGISTER",
            target: `User:${user._id}`,
            details: `New ${userRole} registered`,
            ip: req.ip,
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            token: generateToken(user._id),
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please provide email and password" });
        }

        const user = await User.findOne({ email }).select("+password");

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Audit log
        await AuditLog.create({
            actor: user._id,
            actorName: user.name,
            action: "LOGIN",
            target: `User:${user._id}`,
            ip: req.ip,
        });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            token: generateToken(user._id),
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    res.json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone,
        lastLocation: req.user.lastLocation,
        createdAt: req.user.createdAt,
    });
};

// @desc    Update user location
// @route   PUT /api/auth/location
// @access  Private
const updateLocation = async (req, res, next) => {
    try {
        const { lat, lng } = req.body;

        if (!lat || !lng) {
            return res.status(400).json({ message: "Latitude and longitude required" });
        }

        await User.findByIdAndUpdate(req.user._id, {
            lastLocation: {
                type: "Point",
                coordinates: [parseFloat(lng), parseFloat(lat)],
            },
        });

        res.json({ message: "Location updated" });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all responders for task assignment (admin)
// @route   GET /api/auth/responders
// @access  Private (admin)
const getResponders = async (req, res, next) => {
    try {
        const responders = await User.find({ role: "responder" }).select("name email phone lastLocation");
        res.json(responders);
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login, getMe, updateLocation, getResponders };
