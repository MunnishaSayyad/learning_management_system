import { Router } from "express";
import { getCurrentCourseProgress,markCurrentLectureAsViewed,resetCurrentCourseProgress } from "../controllers/course-progess.contoller";
const router = Router();

router.get('/get/:studentId/:courseId', getCurrentCourseProgress);
router.post("/mark-lecture-viewed", markCurrentLectureAsViewed);
router.post("/reset-progress", resetCurrentCourseProgress);

export default router;