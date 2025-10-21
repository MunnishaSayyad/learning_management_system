import mongoose, { Schema, Document,model } from "mongoose";

export interface Notification extends Document {
  userId: string;             // Target user (instructor)
  type: "enrollment" | "message" | "review"; // You can add more types
  title: string;
  message: string;
  courseId?: string;
  studentId?: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<Notification>({
  userId: { type: String, required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  courseId: { type: String },
  studentId: { type: String },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Notification = model<Notification>("Notification", NotificationSchema);

