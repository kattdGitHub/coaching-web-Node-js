const mongoose = require("mongoose");
const double = require("mongoose-double")(mongoose);

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
    },
    postcode: {
      type: String,
    },
    country: {
      type: String,
    },
    state: {
      type: String,
    },
    city: {
      type: String,
    },
    web_url: {
      type: String,
    },
    primary_phone: {
      type: String,
    },
    secondary_phone: {
      type: String,
    },
    email: {
      type: String,
    },
    bio: {
      type: String,
    },
    description: {
      type: String,
    },

    photo: {
      type: String,
    },
  },
  {
    timestamps: true, // Add timestamps to the schema
  }
);
userSchema.virtual("ismatch", {
  ref: "screenAlot",
  localField: "_id",
  foreignField: "screen_id",
  justOne: true,
});
userSchema.set("toJSON", { virtuals: true });

const Institute = mongoose.model("Institute", userSchema);

module.exports = Institute;
