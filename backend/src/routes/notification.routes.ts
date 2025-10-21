import { Router } from "express";
import { getNotifications } from "../controllers/notification.controller";
import { authenticate, authorizeRoles } from "../middlewares/auth";

const router = Router();

router.get('/get/:id',authenticate,authorizeRoles('instructor'),  getNotifications);

export default router;