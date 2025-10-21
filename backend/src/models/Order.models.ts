import mongoose, { Schema, Document } from "mongoose";

// Interface for Order document
export interface IOrder extends Document {
  userId: string;
  userName: string;
  userEmail: string;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  orderDate: Date;
  paymentId: string;
  payerId: string;
  instructorId: string;
  instructorName: string;
  courseImage: string;
  courseTitle: string;
  courseId: string;
  coursePricing: string;
}

// Define the schema
const OrderSchema = new Schema<IOrder>({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  orderStatus: { type: String, required: true }, // e.g. 'pending', 'completed'
  paymentMethod: { type: String, required: true }, // e.g. 'paypal'
  paymentStatus: { type: String, required: true }, // e.g. 'paid', 'unpaid'
  orderDate: { type: Date, default: Date.now },
  paymentId: { type: String },
  payerId: { type: String },
  instructorId: { type: String, required: true },
  instructorName: { type: String, required: true },
  courseImage: { type: String, required: true },
  courseTitle: { type: String, required: true },
  courseId: { type: String, required: true },
  coursePricing: { type: String, required: true },
});

// Export the model
const Order = mongoose.model<IOrder>("Order", OrderSchema);
export default Order;
