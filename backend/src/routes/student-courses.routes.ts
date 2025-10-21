import { Router } from "express";
import { getCoursesByStudentId } from "../controllers/student-courses.controller";
import { authenticate,authorizeRoles } from "../middlewares/auth";
const router = Router();
router.get('/get/:studentId', authenticate, authorizeRoles('student'), getCoursesByStudentId);

export default router;