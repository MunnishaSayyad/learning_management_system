import express from "express";
import {
  addNewCourse,
  getAllCourses,
  getCourseDetailsByID,
  updateCourseByID,
  deleteCourseByID,
} from "../controllers/course.controller";
import { authenticate, authorizeRoles } from "../middlewares/auth";

const router = express.Router();

router.post("/add",authenticate,authorizeRoles("instructor"), addNewCourse);
router.get("/get",authenticate,authorizeRoles("instructor"), getAllCourses);
router.get("/get/details/:id",authenticate, authorizeRoles("instructor"),getCourseDetailsByID);
router.patch("/update/:id",authenticate,authorizeRoles("instructor"), updateCourseByID);
router.delete("/delete/:id",authenticate, authorizeRoles("instructor"),deleteCourseByID);

export default router;
