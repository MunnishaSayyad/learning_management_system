import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from "./pages/AuthPage";
import RouteGuard from "./components/route-gaurd";
import { useAuth } from "./context/AuthContext";
import AdminDashboardPage from "./pages/admin";
import InstructorDashboardPage from "./pages/Instructor";
import StudentHomePage from "./pages/student/home";
import StudentViewCommonLayout from "./components/student-view/common-layout";
import NotFoundPage from "./pages/not-found";
import AddCoursePage from "./pages/Instructor/AddCourse";

import DashboardContentWrapper from "./pages/Instructor/Dashboard-content-wrapper";
import EnrolledStudents from "./components/instructor-view/EnrolledStudents";

import Navbar from "./components/Navbar";
import StudentViewCoursesPage from "./pages/student/courses";
import StudentViewCourseDetialsPage from "./pages/student/CourseDetials";

import PaymentReturn from "./pages/student/PaymentReturn";
import StudentCourses from "./pages/student/StudentCourses";
import StudentViewCourseProgressPage from "./pages/student/CourseProgress";
import InstructorNotifications from "./components/instructor-view/Notifications";

function App() {
  const { user } = useAuth()
  const authenticated = !!user;
  console.log("user:", user);

  return (

    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white transition-colors duration-300">

      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />
      <Routes>
        <Route
          path="/auth"
          element={
            <RouteGuard
              element={<AuthPage />}
              authenticated={authenticated}
              user={user}
            />
          }
        />
        <Route
          path="/instructor"
          element={
            <RouteGuard
              element={<InstructorDashboardPage />}
              authenticated={authenticated}
              user={user}
            />
          }
        >
          <Route path="dashboard" element={<DashboardContentWrapper />} />
          <Route path="create-new-course" element={<AddCoursePage />} />
          <Route path="enrolled-students" element={<EnrolledStudents />} />
          <Route path="edit-course/:courseId" element={<AddCoursePage />} />
          <Route path="notifications" element={<InstructorNotifications />} />


          {/* Default redirect if /instructor */}
          <Route index element={<Navigate to="dashboard" />} />

        </Route>

        <Route
          path="/admin"
          element={
            <RouteGuard
              element={<AdminDashboardPage />}
              authenticated={authenticated}
              user={user}
            />
          }
        />
        <Route
          path="/"
          element={
            <RouteGuard
              element={<StudentViewCommonLayout />}
              authenticated={authenticated}
              user={user}
            />
          }
        >

          <Route path="" element={<StudentHomePage />} />
          <Route path="home" element={<StudentHomePage />} />
          <Route path="explore-courses" element={<StudentViewCoursesPage />} />
          <Route path="course/details/:id" element={<StudentViewCourseDetialsPage />} />
          <Route path="payment-return" element={<PaymentReturn />} />
          <Route path="student-courses" element={<StudentCourses />} />
          <Route path="course-progress/:id" element={<StudentViewCourseProgressPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />

      </Routes>

    </div>
  )
}

export default App
