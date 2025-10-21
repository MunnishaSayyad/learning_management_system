import { Request, Response, NextFunction} from "express";
import Course from "../models/course.model";
import StudentCourses from "../models/studentCourses.model";

import { AuthRequest } from "../middlewares/auth";

// ✅ POST /add - Only instructor can add courses
export const addNewCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const id = req.userId;
  console.log("instructor Id",id);

  try {
    const newCourse = await Course.create({
      ...req.body,
      instructorId: id,
    });

    res.status(201).json({ success: true, data: newCourse });
  } catch (error) {
    next(error);
  }
};

// ✅ GET /get - Instructor sees only their courses
export const getAllCourses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const id = req.userId;

  try {
    const courses = await Course.find({ instructorId: id});
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
};

// ✅ GET /get/details/:id
export const getCourseDetailsByID = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;

  try {
    const course = await Course.findById(id);
    if (!course) {
      res.status(404).json({ success: false, message: "Course not found" });
      return;
    }
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

// ✅ PATCH /update/:id - Only course creator can update
// ✅ PATCH /update/:id
export const updateCourseByID = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const instructorId = req.userId;

  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404).json({ success: false, message: "Course not found" });
      return;
    }

    if (course.instructorId.toString() !== instructorId) {
      res.status(403).json({ success: false, message: "You are not authorized to update this course" });
      return;
    }

    // ❌ Remove sensitive/unwanted fields
    const disallowedFields = ["students"];
    disallowedFields.forEach((field) => delete req.body[field]);

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.status(200).json({ success: true, data: updatedCourse });
  } catch (error) {
    next(error);
  }
};


// ✅ DELETE /delete/:id - Only course creator can delete

export const deleteCourseByID = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const instructorId = req.userId;

  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404).json({ success: false, message: "Course not found" });
      return;
    }

    if (course.instructorId.toString() !== instructorId) {
      res.status(403).json({ success: false, message: "You are not authorized to delete this course" });
      return;
    }

    const courseId = course.id.toString();

    // Delete the course
    await course.deleteOne();

    // Remove the course from all student enrolled lists
    await StudentCourses.updateMany(
      { "courses.courseId": courseId },
      { $pull: { courses: { courseId } } }
    );

    res.status(200).json({ success: true, message: "Course deleted and removed from students' records" });
  } catch (error) {
    console.log("Delete course error:", error);
    next(error);
  }
};

