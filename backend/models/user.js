import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "recruiter", "student"],
      required: true
    },

    // Password reset — token is stored as a SHA-256 hash; never stored in plain text
    resetToken: { type: String, default: null },
    // Hard expiry: 1 hour from issue time
    resetTokenExpiry: { type: Date, default: null }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
