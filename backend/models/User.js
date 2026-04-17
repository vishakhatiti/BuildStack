const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
      default: null,
      select: false,
    },
    provider: {
      type: String,
      enum: ["google", "github", "email"],
      required: true,
      default: "email",
    },
    providerId: {
      type: String,
      default: null,
      index: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      default: "",
    },
    github: {
      type: String,
      default: "",
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index(
  { provider: 1, providerId: 1 },
  { unique: true, partialFilterExpression: { providerId: { $type: "string" } } }
);

module.exports = mongoose.model("User", userSchema);
