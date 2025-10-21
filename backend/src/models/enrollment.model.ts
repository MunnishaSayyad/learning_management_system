import mongoose, { Schema, Document, Types } from "mongoose";

export interface IEnrollment extends Document {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  progress: number;
  status: "active" | "completed";
}

const enrollmentSchema = new Schema<IEnrollment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    progress: { type: Number, default: 0 }, // in percentage
    status: { type: String, enum: ["active", "completed"], default: "active" },
  },
  { timestamps: true }
);

const Enrollment = mongoose.model<IEnrollment>("Enrollment", enrollmentSchema);
export default Enrollment;
