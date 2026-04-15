const express = require("express");
const { createProject, listProjects, getDashboard } = require("../controllers/projectController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", listProjects);
router.post("/", createProject);
router.get("/dashboard", getDashboard);

module.exports = router;
