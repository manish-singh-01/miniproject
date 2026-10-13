const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
    createTask,
    getMyTasks,
    getAllTasks,
    updateTaskStatus,
} = require("../controllers/taskController");

const router = express.Router();

router.get("/mine", protect, authorize("responder"), getMyTasks);
router.get("/", protect, authorize("admin"), getAllTasks);
router.post("/", protect, authorize("admin"), createTask);
router.patch("/:id/status", protect, authorize("responder"), updateTaskStatus);

module.exports = router;
