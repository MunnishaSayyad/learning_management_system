// pages/Instructor/DashboardContentWrapper.tsx
import { useInstructor } from "@/context/InstructorContext";
import DashboardContent from "@/components/instructor-view/Dashboard-content";
import { useEffect } from "react";
import { getCourses } from "@/api/index";


const DashboardContentWrapper = () => {

  const { instructorCourseList, setInstructorCourseList } = useInstructor();

  const fetchAllCourses = async () => {
    const response = await getCourses();
    console.log(response.data.data);
    if (response.data.success) {
      const courses = response.data.data;
      setInstructorCourseList(courses);
    }

  }
  useEffect(() => {
    fetchAllCourses()
  }, [])

  return <DashboardContent listOfCourses={instructorCourseList}
  />;
};

export default DashboardContentWrapper;
