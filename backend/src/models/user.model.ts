import mongoose, { Document, Schema } from "mongoose";

export type UserRole = "student" | "instructor" | "admin";

export interface IUser extends Document {
  username: string;
  useremail: string;
  password: string;
  role: UserRole;
  isApproved: boolean;

}

const userSchema: Schema<IUser> = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    useremail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema);
export default User;
