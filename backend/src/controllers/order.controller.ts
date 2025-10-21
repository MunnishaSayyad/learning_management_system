import { Request, Response } from "express";
import paypal from "../utils/paypal";
import Order from "../models/Order.models";
import Course from "../models/course.model";
import StudentCourses from "../models/studentCourses.model";
import { Notification } from "../models/course-notifications.model";

import { config } from "dotenv";
config();
export const createOrder = async (req: Request, res: Response):Promise<void> => {
  try {
    const {
      userId,
      userName,
      userEmail,
      orderStatus,
      paymentMethod,
      paymentStatus,
      orderDate,
      paymentId,
      payerId,
      instructorId,
      instructorName,
      courseImage,
      courseTitle,
      courseId,
      coursePricing,
    } = req.body;

    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: `${process.env.CLIENT_URL}/payment-return`,
        cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: courseTitle,
                sku: courseId,
                price: parseFloat(coursePricing).toFixed(2),
                currency: "USD",
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: "USD",
            total: parseFloat(coursePricing).toFixed(2),
          },
          description: courseTitle,
        },
      ],
    };

    paypal.payment.create(create_payment_json, async (error: any, paymentInfo: any) => {
      if (error) {
        console.error(error);
         res.status(500).json({
          success: false,
          message: "Error while creating PayPal payment.",
         });
        return;
      }

      const newOrder = new Order({
        userId,
        userName,
        userEmail,
        orderStatus,
        paymentMethod,
        paymentStatus,
        orderDate,
        paymentId,
        payerId,
        instructorId,
        instructorName,
        courseImage,
        courseTitle,
        courseId,
        coursePricing,
      });

      await newOrder.save();

      const approvalUrl = paymentInfo.links.find(
        (link: any) => link.rel === "approval_url"
      )?.href;

      if (!approvalUrl) {
         res.status(500).json({
          success: false,
          message: "Approval URL not found in PayPal response.",
         });
        return;
      }

      res.status(201).json({
        success: true,
        data: {
          approveUrl: approvalUrl,
          orderId: newOrder._id,
        },
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Some error occurred while creating the order.",
    });
  }
};

export const capturePaymentAndFinalizeOrder = async (req: Request, res: Response):Promise<void> => {
  try {
    const { paymentId, payerId, orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
       res.status(404).json({
        success: false,
        message: "Order not found.",
       });
      return;
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = paymentId;
    order.payerId = payerId;
    await order.save();

    // Update StudentCourses
    const studentCourses = await StudentCourses.findOne({ userId: order.userId });

    const courseEntry = {
      courseId: order.courseId,
      title: order.courseTitle,
      instructorId: order.instructorId,
      instructorName: order.instructorName,
      dateOfPurchase: order.orderDate,
      courseImage: order.courseImage,
    };

    if (studentCourses) {
      studentCourses.courses.push(courseEntry);
      await studentCourses.save();
    } else {
      const newStudentCourses = new StudentCourses({
        userId: order.userId,
        courses: [courseEntry],
      });
      await newStudentCourses.save();
    }

    // Update Course enrollment
    await Course.findByIdAndUpdate(order.courseId, {
      $addToSet: {
        students: {
          studentId: order.userId,
          studentName: order.userName,
          studentEmail: order.userEmail,
          paidAmount: order.coursePricing,
        },
      },
    });

    
    //Save the Notification in DB
    await Notification.create({
      userId: order.instructorId,
      type: "enrollment",
      title: "New Enrollment",
      message: `📩 Student ${order.userName} enrolled in your course: ${order.courseTitle}`,
      courseId: order.courseId,
      studentId: order.userId,
    });


    // ✅ Emit notification to instructor
    const io = req.app.get("io");

    if (io) {
      io.to(order.instructorId.toString()).emit("notification:new-enrollment", {
        courseId: order.courseId,
        studentId: order.userId,
        studentName: order.userName,
        studentEmail: order.userEmail,
        message: `📩 Student ${order.userName} enrolled in your course: ${order.courseTitle}`,
      });
    }

    

    res.status(200).json({
      success: true,
      message: "Order confirmed and payment captured.",
      data: order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "An error occurred while confirming the order.",
    });
  }
};
