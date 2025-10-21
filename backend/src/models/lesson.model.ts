import mongoose, { Schema, Document, Types } from "mongoose";

export interface ILesson extends Document {
  title: string;
  content: string;
  videoUrl?: string;
  moduleId: Types.ObjectId;
  completedByUsers: Types.ObjectId[];
}

const lessonSchema = new Schema<ILesson>(
  {
    title: { type: String, required: true },
    content: { type: String },
    videoUrl: { type: String },
    moduleId: { type: Schema.Types.ObjectId, ref: "Module", required: true },
    completedByUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Lesson = mongoose.model<ILesson>("Lesson", lessonSchema);
export default Lesson;
