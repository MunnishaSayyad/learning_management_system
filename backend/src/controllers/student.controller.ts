import { Request, Response, NextFunction } from "express";
import Course from "../models/course.model";
import StudentCourses from "../models/studentCourses.model";

export const getStudentViewCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = req.query as {
      category?: string;
      level?: string;
      primaryLanguage?: string;
      sortBy?: string;
    };

    const { category = "", level = "", primaryLanguage = "", sortBy = "price-lowtohigh" } = query;

    const filters: Record<string, any> = {};

    if (category) {
      filters.category = { $in: category.split(",") };
    }

    if (level) {
      filters.level = { $in: level.split(",") };
    }

    if (primaryLanguage) {
      filters.primaryLanguage = { $in: primaryLanguage.split(",") };
    }

    const sortParams: Record<string, 1 | -1> = {};
    switch (sortBy) {
      case "price-lowtohigh":
        sortParams.pricing = 1;
        break;
      case "price-hightolow":
        sortParams.pricing = -1;
        break;
      case "title-atoz":
        sortParams.title = 1;
        break;
      case "title-ztoa":
        sortParams.title = -1;
        break;
      default:
        sortParams.pricing = 1;
        break;
    }

    const coursesList = await Course.find(filters).collation({ locale: "en", strength: 2 }).sort(sortParams);
    console.log("sorted list:", coursesList);
    console.log("Sorted Titles:", coursesList.map(c => c.title));


    res.status(200).json({ success: true, data: coursesList });
  } catch (error) {
    next(error);
  }
};

export const getStudentViewCourseDetailsById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id} = req.params;

  try {
    const courseDetails = await Course.findById(id);
    console.log(courseDetails);
    if (!courseDetails) {
      
      res.status(404).json({
        success: false,
        message: "No course details found",
        data:[]
      })
      return;
    }
    res.status(200).json({
      success: true,
      data: courseDetails,
    })
    
  } catch (error) {
    next(error);
  }
 
}

export const checkCoursePurchasedInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id,studentId} = req.params;
  try {
    const studentEnrolledCourses = await StudentCourses.findOne({ userId: studentId });
    const ifStudentAleadyEnrolledInTheCourse = studentEnrolledCourses?.courses.some(
      (item) => item.courseId === id
    );
    console.log("Student Purchased Courses:", ifStudentAleadyEnrolledInTheCourse);
    res.status(200).json({
      success: true,
      data: ifStudentAleadyEnrolledInTheCourse,
    })
    
  } catch (error) {
    next(error);
  }
 }
