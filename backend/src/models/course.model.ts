// models/Course.ts
import mongoose, { Schema, Document, Types } from "mongoose";

// ------------ Sub Types ------------
export interface Lecture {
  _id?: Types.ObjectId;
  lectureTitle: string;
  fileUrl: string;
  fileType: string;
  freePreview: boolean;
  public_id: string;
}

export interface Section {
  _id?: Types.ObjectId;
  sectionTitle: string;
  lectures: Lecture[];
}

export interface EnrolledStudent {
  studentId: Types.ObjectId;
  studentName: string;
  studentEmail: string;
  paidAmount: string;
}

// ------------ Main Course Interface ------------
export interface ICourse extends Document {
  instructorId: Types.ObjectId;
  instructorName: string;
  instructorEmail: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: string;
  primaryLanguage: string;
  pricing: string;
  objectives: string;
  welcomeMessage: string;
  image: string;
  curriculum: Section[];
  students: EnrolledStudent[];
  isPublishedd: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// ------------ Sub Schemas ------------
const LectureSchema = new Schema<Lecture>(
  {
    lectureTitle: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true },
    freePreview: { type: Boolean, default: false },
    public_id: { type: String, required: true },
  },
  { _id: true }
);

const SectionSchema = new Schema<Section>(
  {
    sectionTitle: { type: String, required: true },
    lectures: { type: [LectureSchema], default: [] },
  },
  { _id: true }
);

const EnrolledStudentSchema = new Schema<EnrolledStudent>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    paidAmount:{type:String, required:true}
  },
  { _id: true }
);

// ------------ Course Schema ------------
const courseSchema = new Schema<ICourse>(
  {
    instructorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    instructorName: { type: String, required: true },
    instructorEmail: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    description: { type: String },
    category: { type: String },
    level: { type: String },
    primaryLanguage: { type: String },
    pricing: { type: String },
    objectives: { type: String },
    welcomeMessage: { type: String },
    image: { type: String },
    curriculum: { type: [SectionSchema], default: [] },
    students: { type: [EnrolledStudentSchema], default: [] },
    isPublishedd: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Course = mongoose.model<ICourse>("Course", courseSchema);
export default Course;
