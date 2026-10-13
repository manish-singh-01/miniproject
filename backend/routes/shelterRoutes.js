const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
    getNearbyShelters,
    getAllShelters,
    createShelter,
    updateShelter,
} = require("../controllers/shelterController");

const router = express.Router();

router.get("/nearby", getNearbyShelters);
router.get("/", getAllShelters);
router.post("/", protect, authorize("admin"), createShelter);
router.patch("/:id", protect, authorize("admin"), updateShelter);

module.exports = router;
