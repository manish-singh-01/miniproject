const Task = require("../models/Task");
const AuditLog = require("../models/AuditLog");

// @desc    Assign a task to a responder (admin)
// @route   POST /api/tasks
// @access  Private (admin)
const createTask = async (req, res, next) => {
    try {
        const { incidentId, assignedTo, title, description } = req.body;

        const task = await Task.create({
            incidentId,
            assignedTo,
            assignedBy: req.user._id,
            title,
            description,
        });

        // Notify the responder via Socket.io
        const io = req.app.get("io");
        if (io) {
            io.to(`user:${assignedTo}`).emit("task:assigned", {
                taskId: task._id,
                title: task.title,
                incidentId,
            });
        }

        await AuditLog.create({
            actor: req.user._id,
            actorName: req.user.name,
            action: "ASSIGN_TASK",
            target: `Task:${task._id}`,
            details: `Assigned task "${title}" to responder ${assignedTo}`,
            ip: req.ip,
        });

        res.status(201).json(task);
    } catch (error) {
        next(error);
    }
};

// @desc    Get tasks assigned to me (responder)
// @route   GET /api/tasks/mine
// @access  Private (responder)
const getMyTasks = async (req, res, next) => {
    try {
        const tasks = await Task.find({ assignedTo: req.user._id })
            .populate("incidentId", "type severity location address")
            .populate("assignedBy", "name")
            .sort({ createdAt: -1 });

        res.json(tasks);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all tasks (admin)
// @route   GET /api/tasks
// @access  Private (admin)
const getAllTasks = async (req, res, next) => {
    try {
        const tasks = await Task.find()
            .populate("incidentId", "type severity location address")
            .populate("assignedTo", "name email phone")
            .populate("assignedBy", "name")
            .sort({ createdAt: -1 });

        res.json(tasks);
    } catch (error) {
        next(error);
    }
};

// @desc    Update task status (responder)
// @route   PATCH /api/tasks/:id/status
// @access  Private (responder)
const updateTaskStatus = async (req, res, next) => {
    try {
        const { status, notes } = req.body;
        const validStatuses = ["assigned", "en_route", "on_site", "done"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        // Ensure responder owns this task
        if (task.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        task.status = status;
        if (notes) task.notes = notes;

        // Record transition timestamp
        if (status === "en_route") task.enRouteAt = new Date();
        if (status === "on_site") task.onSiteAt = new Date();
        if (status === "done") task.doneAt = new Date();

        await task.save();

        // Notify admin via Socket.io
        const io = req.app.get("io");
        if (io) {
            io.to("role:admin").emit("task:updated", {
                taskId: task._id,
                status: task.status,
                responder: req.user.name,
            });
        }

        res.json(task);
    } catch (error) {
        next(error);
    }
};

module.exports = { createTask, getMyTasks, getAllTasks, updateTaskStatus };
