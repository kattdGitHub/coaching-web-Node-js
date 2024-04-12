const Course = require("../../../models/user/course");

// Create operation
async function createCourse(req, res, next) {
  try {
    const courseData = req.body;
    const course = await Course.create(courseData);
    return res
      .status(201)
      .json({
        statusCode: 201,
        message: "Course created successfully",
        data: course,
      });
  } catch (error) {
    console.error("Caught error:", error);
    return res.status(500).json({ statusCode: 500, error });
  }
}
// Read operation: Get all courses
async function getAllCourses(req, res, next) {
  try {
    const courses = await Course.find();
    return res.status(200).json({ statusCode: 200, data: courses });
  } catch (error) {
    console.error("Caught error:", error);
    return res.status(500).json({ statusCode: 500, error });
  }
}

// Read operation
async function getCourse(req, res, next) {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ statusCode: 404, message: "Course not found" });
    }
    return res.status(200).json({ statusCode: 200, data: course });
  } catch (error) {
    console.error("Caught error:", error);
    return res.status(500).json({ statusCode: 500, error });
  }
}

// Update operation
async function updateCourse(req, res, next) {
  try {
    const courseId = req.params.id;
    const newData = req.body;
    const updatedCourse = await Course.findByIdAndUpdate(courseId, newData, {
      new: true,
    });
    if (!updatedCourse) {
      return res
        .status(404)
        .json({ statusCode: 404, message: "Course not found" });
    }
    return res
      .status(200)
      .json({
        statusCode: 200,
        message: "Course updated successfully",
        data: updatedCourse,
      });
  } catch (error) {
    console.error("Caught error:", error);
    return res.status(500).json({ statusCode: 500, error });
  }
}

// Delete operation
async function deleteCourse(req, res, next) {
  try {
    const courseId = req.params.id;
    const deletedCourse = await Course.findByIdAndDelete(courseId);
    if (!deletedCourse) {
      return res
        .status(404)
        .json({ statusCode: 404, message: "Course not found" });
    }
    return res
      .status(200)
      .json({ statusCode: 200, message: "Course deleted successfully" });
  } catch (error) {
    console.error("Caught error:", error);
    return res.status(500).json({ statusCode: 500, error });
  }
}

module.exports = {
  createCourse,
  getCourse,
  updateCourse,
  getAllCourses,
  deleteCourse,
};
