import mongoose, { Schema, Document } from 'mongoose';

interface ICourse {
  courseId: string;
  title: string;
  instructorId: string;
  instructorName: string;
  dateOfPurchase: Date;
  courseImage: string;
}


export interface IStudentCourses extends Document {
  userId: mongoose.Types.ObjectId;
  courses: ICourse[];
}

const CourseSchema = new Schema<ICourse>({
  courseId: { type: String, required: true },
  title: { type: String, required: true },
  instructorId: { type: String, required: true },
  instructorName: { type: String, required: true },
  dateOfPurchase: { type: Date, default: Date.now },
  courseImage: { type: String, required: true },
});


const StudentCoursesSchema = new Schema<IStudentCourses>({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', unique: true },
  courses: { type: [CourseSchema], default: [] }
}, { timestamps: true });

const StudentCourses = mongoose.model<IStudentCourses>('StudentCourses', StudentCoursesSchema);

export default StudentCourses;
