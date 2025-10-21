import mongoose, { Schema, Document, Types } from "mongoose";

export interface IModule extends Document {
  title: string;
  courseId: Types.ObjectId;
  lessons: Types.ObjectId[];
}

const moduleSchema = new Schema<IModule>(
  {
    title: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    lessons: [{ type: Schema.Types.ObjectId, ref: "Lesson" }],
  },
  { timestamps: true }
);

const Module = mongoose.model<IModule>("Module", moduleSchema);
export default Module;
