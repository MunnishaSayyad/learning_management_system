import { Router } from "express";
import { getStudentViewCourseDetailsById, getStudentViewCourses, checkCoursePurchasedInfo } from "../controllers/student.controller";
import { authenticate } from "../middlewares/auth";
const router = Router();

router.get("/get", authenticate, getStudentViewCourses);
router.get("/get/details/:id",authenticate, getStudentViewCourseDetailsById);
router.get("/purchase-info/:id/:studentId",authenticate, checkCoursePurchasedInfo);

export default router;