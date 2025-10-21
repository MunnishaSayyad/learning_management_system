import { Request, Response, NextFunction } from "express";
import StudentCourses from "../models/studentCourses.model";

export const getCoursesByStudentId = async (req:Request, res:Response, next:NextFunction) => {
  try {
    const { studentId } = req.params;

    const studentEnrolledCourses = await StudentCourses.findOne({
      userId: studentId,
    });
    
    res.status(200).json({
      success: true,
      data: studentEnrolledCourses?.courses,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

