//.server/routes/projectRoutes

const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createProject,
  getAllProjects,
  getProjectById,
  markProjectComplete,
  assignDevelopers,
  uploadDocument,
  getProjectDocuments,
  deleteProject
} = require("../controllers/projectController");

// Admin creates project
router.post("/", auth(["admin"]), createProject);

// Everyone views projects
router.get("/", auth(), getAllProjects);

// View project details (assigned only)
router.get("/:id", auth(), getProjectById);

// Admin marks complete
router.patch("/:id/complete", auth(["admin"]), markProjectComplete);

// Lead assigns developers
router.patch("/:projectId/assign", auth(["lead"]), assignDevelopers);

// Upload document (Admin/Lead)
router.post("/:id/upload", auth(["admin", "lead"]), uploadDocument);


// View Documents - accessible by assigned users
router.get("/:id/documents", auth(["admin", "lead", "developer"]), getProjectDocuments);


//delete project (admin only)
router.delete("/:projectId", auth(["admin"]), deleteProject);


module.exports = router;
