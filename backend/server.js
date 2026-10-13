require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// Route imports
const authRoutes = require("./routes/authRoutes");
const incidentRoutes = require("./routes/incidentRoutes");
const alertRoutes = require("./routes/alertRoutes");
const shelterRoutes = require("./routes/shelterRoutes");
const taskRoutes = require("./routes/taskRoutes");

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// ─── Socket.io Setup ────────────────────────────────────────────────────────
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

// Attach io instance to app so controllers can use it via req.app.get("io")
app.set("io", io);

io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Client joins its own user room and role room after auth
    socket.on("join", ({ userId, role }) => {
        if (userId) socket.join(`user:${userId}`);
        if (role) socket.join(`role:${role}`);
        console.log(`Socket ${socket.id} joined user:${userId} role:${role}`);
    });

    socket.on("disconnect", () => {
        console.log(`❌ Socket disconnected: ${socket.id}`);
    });
});

// ─── Security Middleware ─────────────────────────────────────────────────────
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(cors({
    origin: "*", // tighten in production
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
}));

// ─── Body Parser ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/shelters", shelterRoutes);
app.use("/api/tasks", taskRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
    res.json({
        message: "🚨 Disaster Management Portal API is running",
        version: "1.0.0",
        status: "OK",
    });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});