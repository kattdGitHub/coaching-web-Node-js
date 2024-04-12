// Import necessary modules and the Course model
const express = require("express");
const router = express.Router();
const {
  createCourse,
  getCourse,
  updateCourse,
  deleteCourse,
  getAllCourses,
} = require("../../../controller/user/users/course");

// Create a new course
router.post("/course/", createCourse);

// Get all courses
router.get("/course/", getAllCourses);

// Get a course by ID
router.get("/course/:id", getCourse);

// Update a course by ID
router.put("/course/:id", updateCourse);

// Delete a course by ID
router.delete("/course/:id", deleteCourse);

module.exports = router;
