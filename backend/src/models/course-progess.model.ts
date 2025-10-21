import mongoose, { Document, Schema, model } from "mongoose";

interface ILectureProgress {
  lectureId: string;
  viewed: boolean;
  dateViewed: Date;
}

export interface ICourseProgress extends Document {
  userId: string;
  courseId: string;
  completed: boolean;
  completionDate?: Date;
  lecturesProgress: ILectureProgress[];
}

const LectureProgressSchema = new Schema<ILectureProgress>({
  lectureId: { type: String, required: true },
  viewed: { type: Boolean, default: false },
  dateViewed: { type: Date , default:null},
});

const CourseProgressSchema = new Schema<ICourseProgress>({
  userId: { type: String, required: true },
  courseId: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completionDate: { type: Date },
  lecturesProgress: { type: [LectureProgressSchema], default: [] },
});

export const CourseProgress = model<ICourseProgress>("Progress", CourseProgressSchema);
