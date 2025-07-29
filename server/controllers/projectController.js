//.server/controllers/projectControllers


const Project = require("../models/Project");
const User = require("../models/User");

// 1. Admin creates a new project
exports.createProject = async (req, res, next) => {
  try {
    const { name, description, deadline, lead } = req.body;

    // verify lead exists
    if (lead) {
      const leadUser = await User.findById(lead);
      if (!leadUser || leadUser.role !== "lead") {
        return res.status(400).json({ msg: "Invalid project lead" });
      }
    }

    const project = await Project.create({
      name,
      description,
      deadline,
      lead
    });

    res.status(201).json({ msg: "Project created", project });
  } catch (err) {
    next(err);
  }
};



// 2. All users: View active projects
exports.getAllProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ status: "Active" }).populate("lead", "name");
    res.json(projects);
  } catch (err) {
    next(err);
  }
};


// 3. Get project by ID (only if assigned or lead/admin)
exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("lead", "name")
      .populate("developers", "name")
      .lean();

    if (!project) return res.status(404).json({ msg: "Project not found" });

    const userId = req.user.id;
    const isAllowed = project.lead?._id.toString() === userId ||
                      project.developers?.some(dev => dev._id.toString() === userId) ||
                      req.user.role === "admin";

    if (!isAllowed) return res.status(403).json({ msg: "Access denied" });

    res.json(project);
  } catch (err) {
    next(err);
  }
};


// 4. Admin: Mark project as complete
exports.markProjectComplete = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status: "Completed" },
      { new: true }
    );

    if (!project) return res.status(404).json({ msg: "Project not found" });

    res.json({ msg: "Project marked as completed", project });
  } catch (err) {
    next(err);
  }
};


//5. Lead: Assign developers to their project
exports.assignDevelopers = async (req, res, next) => {
  try {
    const { developersId } = req.body; // Expecting array of developer IDs
    const { projectId } = req.params;

    console.log("projectId:", projectId);

    if (!developersId || !Array.isArray(developersId) || developersId.length === 0) {
      return res.status(400).json({
        success: false,
        message: "A non-empty array of developer IDs is required.",
      });
    }

    const project = await Project.findById(projectId);
    console.log("Fetched Project:", project);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    // Check if current user is the project lead
    if (project.lead.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the project lead can assign developers.",
      });
    }

    // Assign developers (replace all or merge — your choice)
    project.developers = developersId;
    await project.save();

    res.status(200).json({
      success: true,
      message: "Developers assigned successfully.",
      project,
    });
  } catch (err) {
    console.error(err);
    next(err); // send to error middleware
  }
};


//6. Admin/Lead: Upload document (mocked file upload)
exports.uploadDocument = async (req, res, next) => {
  try {
    const { filename, url } = req.body;

    if (!filename || !url) {
      return res.status(400).json({
        success: false,
        message: "Filename and URL are required."
      });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    const isOwner = project.lead?.toString() === req.user.id || req.user.role === "admin";
    if (!isOwner) {
      return res.status(403).json({ success: false, message: "Not allowed." });
    }

    project.documents.push({ filename, url });
    await project.save();

    res.json({ success: true, message: "Document uploaded", documents: project.documents });
  } catch (err) {
    next(err);
  }
};




// View Documents
exports.getProjectDocuments = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id).populate("developers").populate("lead");
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    // Check if the user is part of the project
    const isAssigned =
      req.user.role === "admin" ||
      project.lead?.toString() === req.user.id ||
      project.developers?.some(dev => dev._id.toString() === req.user.id);

    if (!isAssigned) {
      return res.status(403).json({ success: false, message: "Access denied. Not assigned to this project." });
    }

    res.status(200).json({
      success: true,
      message: "Project documents fetched",
      documents: project.documents,
    });
  } catch (err) {
    next(err);
  }
};



// delete project by admin only
exports.deleteProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404);
      throw new Error("Project not found");
    }

    await Project.findByIdAndDelete(projectId);

    res.status(200).json({ success: true, message: "Project deleted successfully" });
  } catch (err) {
    next(err);
  }
};


