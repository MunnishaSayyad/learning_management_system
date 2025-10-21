import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import rateLimit from "express-rate-limit";
import { Server as SocketIOServer } from "socket.io";
import http from "http";




import { errorHandler } from "./middlewares/errorHandler";
// import logger from './middlewares/logger';

import userRoutes from "./routes/user.routes";
import mediaRoutes from "./routes/cloudinary.routes";
import instructorCourseRoutes from "./routes/course.routes"
import studentViewCourseRoutes from "./routes/student.routes";
import studentOrderRoutes from "./routes/order.routes";
import studentEnrolledCoursesRoutes from './routes/student-courses.routes';
import studentCourseProgessRoutes from './routes/course-progress.routes';
import instructorNotificationRoutes from "./routes/notification.routes";

dotenv.config();

const app = express();
app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
  allowedHeaders:["content-type","Authorization"],
}));
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit:"40kb", extended:true}))

const PORT = process.env.PORT || 5000;
const uri = process.env.MONGO_URI!

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("🟢 A user connected");
  socket.on("join", (userId) => {
    console.log("👤 Received join with userId:", userId);
    if (!userId) {
      console.warn("⚠️ No userId provided for join event");
      return;
    }
    socket.join(userId); // ✅ now joining works
  });
  

  socket.on("disconnect", () => {
    console.log("🔌 A user disconnected");
  });
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

//test route
app.get('/', (req, res) => {
  res.send('LMS Backend is running!');
});

//routes
// app.use(logger);
app.use("/auth", apiLimiter);
app.set("io", io);

app.use("/auth", userRoutes);
app.use("/media", mediaRoutes);
app.use("/instructor/courses", instructorCourseRoutes);
app.use("/student/course", studentViewCourseRoutes);
app.use("/student/order", studentOrderRoutes);
app.use("/student/enrolled-courses", studentEnrolledCoursesRoutes);
app.use("/student/course-progress", studentCourseProgessRoutes);
app.use("/instructor/notifications",instructorNotificationRoutes );

//errorhandler 
app.use(errorHandler);

// Connect MongoDB and start server
mongoose
  .connect(uri)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
  });
