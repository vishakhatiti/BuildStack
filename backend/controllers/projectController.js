const Project = require("../models/Project");

const parseTechStack = (raw) => {
  if (Array.isArray(raw)) return raw.filter(Boolean).map((item) => item.trim()).filter(Boolean);
  if (typeof raw === "string") return raw.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
};

const createProject = async (req, res) => {
  try {
    const { name, techStack, status } = req.body;
    const normalizedTechStack = parseTechStack(techStack);

    if (!name || normalizedTechStack.length === 0) {
      return res.status(400).json({ message: "Project name and tech stack are required" });
    }

    const project = await Project.create({
      user: req.user._id,
      name: name.trim(),
      techStack: normalizedTechStack,
      status: status || "in_progress",
    });

    return res.status(201).json({ project });
  } catch (error) {
    return res.status(500).json({ message: "Unable to create project" });
  }
};

const listProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json({ projects });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch projects" });
  }
};

const getDashboard = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user._id }).sort({ createdAt: -1 });

    const stats = {
      totalProjects: projects.length,
      liveProjects: projects.filter((project) => project.status === "live").length,
      failedProjects: projects.filter((project) => project.status === "failed").length,
      inProgressProjects: projects.filter((project) => project.status === "in_progress").length,
    };

    return res.json({
      stats,
      recentProjects: projects.slice(0, 8),
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load dashboard" });
  }
};

module.exports = { createProject, listProjects, getDashboard };
