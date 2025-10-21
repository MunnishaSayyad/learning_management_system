import { Request, Response,NextFunction } from "express";
import { CourseProgress } from "../models/course-progess.model";
import Course from "../models/course.model";
import StudentCourses from "../models/studentCourses.model";

//mark current lecture as viewed

export const markCurrentLectureAsViewed = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { studentId, courseId, lectureId } = req.body;
    console.log(lectureId);
    console.log(req.body);

    // Fetch the course
    const course = await Course.findById(courseId);

    if (!course) {
       res.status(404).json({
        success: false,
        message: "Course not found",
       });
       return
    }

    // 🔍 Flatten all lectureIds from the curriculum
    const allLectureIds: string[] = course.curriculum
    .flatMap((section) => section.lectures.map((lecture) => lecture._id!.toString()));
    console.log(allLectureIds);

    // ❌ Check if the lectureId is valid
    if (!allLectureIds.includes(lectureId)) {
       res.status(400).json({
        success: false,
        message: "Invalid lectureId. This lecture does not belong to the course.",
       });
       return
    }

    // ✅ Proceed to find or create progress
    let progress = await CourseProgress.findOne({ userId: studentId, courseId });

    if (!progress) {
      progress = new CourseProgress({
        userId: studentId,
        courseId,
        lectureProgress: [
          {
            lectureId,
            viewed: true,
            dateViewed: new Date(),
          },
        ],
      });
    } else {
      const existingLecture = progress.lecturesProgress.find(
        (item) => item.lectureId === lectureId
      );

      if (existingLecture) {
        existingLecture.viewed = true;
        existingLecture.dateViewed = new Date();
      } else {
        progress.lecturesProgress.push({
          lectureId,
          viewed: true,
          dateViewed: new Date(),
        });
      }
    }

    // ✅ Check if all lectures are viewed
    const totalLectures = allLectureIds.length;

    const allLecturesViewed =
      progress.lecturesProgress.length === totalLectures &&
      progress.lecturesProgress.every((item) => item.viewed);

    if (allLecturesViewed) {
      progress.completed = true;
      progress.completionDate = new Date();
    }

    await progress.save();

     res.status(200).json({
      success: true,
      message: "Lecture marked as viewed",
      data: progress,
     });
     return
  } catch (error) {
    next(error);
  }
};

//get course Progress
export const getCurrentCourseProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("get current course progress")
    const { studentId, courseId } = req.params;
    console.log("student and course id from frontend:", req.params);

    const studentPurchasedCourses = await StudentCourses.findOne({ userId: studentId });

    const isPurchased = studentPurchasedCourses?.courses?.some(
      (item) => item.courseId === courseId
    );

    console.log("studentPurchasedCourses:", studentPurchasedCourses);
    console.log("isPurchased:", isPurchased);


    if (!isPurchased) {
      res.status(200).json({
        success: true,
        data:{
          isPurchased: false,
        },
        message: "You need to purchase this course to access it",
      });
      return;
    }

    const currentUserCourseProgress = await CourseProgress.findOne({
      userId: studentId,
      courseId,
    }).populate("courseId");
    console.log("currentUserCourseProgress:", currentUserCourseProgress);


    if (!currentUserCourseProgress || currentUserCourseProgress.lecturesProgress.length === 0) {
      const course = await Course.findById(courseId);
      if (!course) {
        res.status(404).json({
          success: false,
          message: "Purchase the course before accessing",
          
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "No progress found, you can start watching the course",
        data: {
          courseDetails: course,
          progress: [],
          completed: false,
          completionDate: null,
          isPurchased:true,
        },
      });
      console.log("Sending progress data", {
        courseDetails: course,
        progress: [],
        isPurchased: true
      });
      
      return;
    }
    const courseDetails = await Course.findById(courseId);


    res.status(200).json({
      success: true,
      data: {
        courseDetails,
        progress: currentUserCourseProgress.lecturesProgress,
        completed: currentUserCourseProgress.completed,
        completionDate: currentUserCourseProgress.completionDate,
        isPurchased: true,
      },
    });
    
        

  } catch (error) {
    next(error);
  }
};


export const resetCurrentCourseProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => { 
  try {
    const { studentId, courseId } = req.body;
    const progress = await CourseProgress.findOne({ userId: studentId, courseId })
    if (!progress) {
      res.status(400).json({
        success: false,
        message:"Progress not found",
      })
      return;
    }
    progress.lecturesProgress = [];
    progress.completed = false;
    progress.completionDate = undefined;

    await progress.save();

    res.status(200).json({
      success: true,
      messages: "course progress has been reset",
      data:progress
    })
  }catch(err){
    next(err);
  }
}