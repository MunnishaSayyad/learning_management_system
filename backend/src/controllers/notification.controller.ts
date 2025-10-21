import { Notification } from "../models/course-notifications.model";
import { Request, Response,NextFunction } from "express";
export const getNotifications = async (req: Request, res: Response,next:NextFunction):Promise<void> => {
  try {
    const { id } = req.params;
    console.log(id);
    const notifications = await Notification.find({ userId: id }).sort({ createdAt: -1 });
    console.log(notifications);

    res.status(200).json({
      success: true,
      data: notifications,
    });

  } catch (err) {
    next(err);
  }
};
