const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    techStack: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => value.length > 0,
        message: "At least one tech stack item is required",
      },
    },
    status: {
      type: String,
      enum: ["live", "failed", "in_progress"],
      default: "in_progress",
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
