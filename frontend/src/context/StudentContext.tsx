import { type ReactNode, createContext, useContext, useState, useEffect } from "react";
import { fetchStudentViewCourseDetails, fetchStudentViewCourses, checkCousePurchaseInfo } from "@/api";
import { toast } from "react-toastify";
import { fetchStudentEnrolledCourses } from "@/api";
import { useAuth } from "./AuthContext";
import type { EnrolledCourses, CourseData, CourseProgress } from "@/types";


interface StudentContextProps {
  studentViewCourseList: CourseData[];
  studentViewCourseDetails: CourseData | null;
  loading: boolean;
  getCourse: (id: string) => Promise<void>;
  getCoursesByFilters: (filters?: Record<string, string[]>, sort?: string) => Promise<void>;
  studentEnrolledCourses: EnrolledCourses[];
  getStudentEnrolledCourses: () => Promise<void>;
  checkPurchasedCourse: (id: string) => Promise<{ success: boolean; data: boolean }>;
  studentCurrentCourseProgress: CourseProgress | null;
  setStudentCurrentCourseProgress: (progress: CourseProgress | null) => void;
}

const StudentContext = createContext<StudentContextProps>({} as StudentContextProps);

export const StudentProvider = ({ children }: { children: ReactNode }) => {
  const [studentViewCourseList, setStudentViewCourseList] = useState<CourseData[]>([]);
  const [studentViewCourseDetails, setStudentViewCourseDetails] = useState<CourseData | null>(null);
  const [studentEnrolledCourses, setStudentEnrolledCourses] = useState<EnrolledCourses[]>([]);
  const [studentCurrentCourseProgress, setStudentCurrentCourseProgress] = useState<CourseProgress | null>(null);

  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const studentId = user?.id || "";



  const getCoursesByFilters = async (filters?: Record<string, string[]>, sort?: string) => {
    try {
      setLoading(true);
      // Build query string
      const params = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, values]) => {
          if (values.length > 0) {
            params.set(key, values.join(","));
          }
        });
      }
      if (sort) {
        params.set("sortBy", sort);
      }
      const response = await fetchStudentViewCourses(`?${params.toString()}`);
      if (response.data?.success) {
        setStudentViewCourseList(response.data.data);
      } else {
        toast.error("something wrong");
      }
    } catch (error) {
      console.error("Failed to fetch student courses:", error);
      toast.error("Failed to fetch student courses:")
    } finally {
      setLoading(false);
    }
  };

  const getCourse = async (currentCourseDetailsId: string) => {

    try {
      setLoading(true);


      const response = await fetchStudentViewCourseDetails(currentCourseDetailsId);
      console.log("studentVieDetails course response:", response);
      if (response?.data?.success) {
        setStudentViewCourseDetails(response.data.data);
        console.log("course details:", response.data.data);
      } else {
        toast.error("something wrong");
      }
    } catch (error) {
      console.error("Failed to fetch  course details:", error);
      toast.error("Failed to fetch  course detials:")

    } finally {
      setLoading(false)
    }
  }

  const getStudentEnrolledCourses = async () => {
    const response = await fetchStudentEnrolledCourses(studentId);
    if (response?.data?.success) {
      setStudentEnrolledCourses(response?.data?.data);
    }
    console.log("enrolled Response:", response);
  }

  const checkPurchasedCourse = async (courseId: string) => {
    const response = await checkCousePurchaseInfo(courseId, studentId);
    return response.data;
  }

  useEffect(() => {
    if (user) {
      getCoursesByFilters();
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === "student") {
      getStudentEnrolledCourses();
    }
  }, [user]);


  return (
    <StudentContext.Provider value={{
      studentViewCourseList, studentViewCourseDetails, loading, studentEnrolledCourses, studentCurrentCourseProgress, getCourse, getStudentEnrolledCourses, getCoursesByFilters, checkPurchasedCourse,
      setStudentCurrentCourseProgress,
    }}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => useContext(StudentContext);
