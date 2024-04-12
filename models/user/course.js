const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    instructor: {
      type: String,
    },
    price: {
      type: Number,
    },
    duration: {
      type: String,
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    tags: [String], // array of strings for tags
    studentsEnrolled: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: String,
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Courses", courseSchema);
