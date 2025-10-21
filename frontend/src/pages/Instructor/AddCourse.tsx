import { useState, useEffect } from "react";
import CourseLandingPage from "@/components/instructor-view/add-course/course-landing";
import CourseCurriculum from "@/components/instructor-view/add-course/course-cirriculum";
import CourseSettings from "@/components/instructor-view/add-course/course-settings";
import { Button } from "@/components/ui/button";
import { useInstructor } from "@/context/InstructorContext";
import { useAuth } from "@/context/AuthContext";

import { courseCurriculumInitialFormData, courseLandingInitialFormData } from '@/config/index';
// Schemas for validation
import { courseLandingSchema } from "@/components/instructor-view/add-course/course-landing";
import { cirriculumSchema } from "@/components/instructor-view/add-course/course-cirriculum";
import { ImageSchema } from "@/components/instructor-view/add-course/course-settings";

import * as yup from "yup";
import { toast } from "react-toastify";
import { createNewCourse, updateCourseById } from "@/api";
import { useParams } from "react-router-dom";
import { fetchCourseDetails } from "@/api";

import type { CourseData, CourseLandingFormData } from "@/types";
import { useNavigate } from "react-router-dom";



const AddCoursePage = () => {
  const [activeTab, setActiveTab] = useState("landing");
  const { courseLandingFormData, courseCirriculumFormData, setCourseCirriculumFormData, setCourseLandingFormData, currentEditedCourseId, setCurrentEditedCourseId } = useInstructor();

  const { user } = useAuth();
  const { courseId } = useParams();

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();




  const fetchCurrentCourseDetails = async (id: string) => {
    setIsLoading(true);
    const response = await fetchCourseDetails(id);
    if (response.data.success) {
      const courseData = response.data.data;

      const courseFormData: CourseLandingFormData =
        (Object.keys(courseLandingInitialFormData) as (keyof CourseLandingFormData)[]).reduce((acc, key) => {
          acc[key] = courseData[key] ?? courseLandingInitialFormData[key];
          return acc;
        }, { ...courseLandingInitialFormData });

      setCourseLandingFormData(courseFormData);
      setCourseCirriculumFormData(courseData.curriculum || []);
    }
    setIsLoading(false);
  };




  // ✅ Final validation using all schemas
  const validateFormData = async () => {
    try {
      await courseLandingSchema.validate(courseLandingFormData, { abortEarly: false });
      await ImageSchema.validate({ image: courseLandingFormData.image }, { abortEarly: false });
      await cirriculumSchema.validate({ sections: courseCirriculumFormData }, { abortEarly: false });
      return true;
    } catch (err) {
      console.log(err)
      if (err instanceof yup.ValidationError) {
        err.inner.forEach((validationError) => {
          if (validationError.message) {
            toast.error(validationError.message);
          }
        });
      } else {
        toast.error("Validation failed. Please check all fields.");
      }
      return false;
    }
  };
  const [isFormValid, setIsFormValid] = useState(false);





  // ✅ Final Submit Handler
  const handleFinalSubmit = async () => {
    if (!isFormValid) return;
    const isValid = await validateFormData();
    if (!isValid) return;

    if (!user?.id || !user?.username || !user?.useremail) {
      toast.error("User info is missing. Please log in again.");
      return;
    }
    setIsSubmitting(true);


    const isEdit = currentEditedCourseId !== "";

    const finalData: CourseData = {
      instructorId: user.id,
      instructorName: user.username,
      instructorEmail: user.useremail,
      ...courseLandingFormData,
      curriculum: courseCirriculumFormData,
    };

    if (!isEdit) {
      finalData.students = []; // only add during creation
    }


    const response = isEdit
      ? await updateCourseById(currentEditedCourseId, finalData)
      : await createNewCourse(finalData);

    if (response?.data?.success) {

      toast.success(
        isEdit ? "Course updated successfully!" : "Course created successfully!"
      );
      setCourseCirriculumFormData(courseCurriculumInitialFormData);
      setCourseLandingFormData(courseLandingInitialFormData);
      setCurrentEditedCourseId("");
      navigate("/instructor/dashboard");
    }
  };


  useEffect(() => {
    if (courseId) {
      setCurrentEditedCourseId(courseId);
      fetchCurrentCourseDetails(courseId);
    } else {
      setCurrentEditedCourseId("");
      setCourseLandingFormData(courseLandingInitialFormData);
      setCourseCirriculumFormData(courseCurriculumInitialFormData);
    }
  }, [courseId]);

  // Check form validity whenever form data changes
  useEffect(() => {
    if (isSubmitting) return;
    const checkFormValidity = async () => {
      try {
        await courseLandingSchema.validate(courseLandingFormData, { abortEarly: false });
        await ImageSchema.validate({ image: courseLandingFormData.image }, { abortEarly: false });
        await cirriculumSchema.validate({ sections: courseCirriculumFormData }, { abortEarly: false });
        setIsFormValid(true);
      } catch (error: unknown) {
        console.log(error);
        setIsFormValid(false);
      }
    };

    checkFormValidity();
  }, [courseLandingFormData, courseCirriculumFormData]);


  // ✅ Tab Renderer
  const renderTab = () => {
    switch (activeTab) {
      case "curriculum":
        return <CourseCurriculum />;
      case "landing":
        return <CourseLandingPage />;
      case "settings":
        return <CourseSettings />;
      default:
        return <CourseLandingPage />;
    }
  };


  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}


      <div className="flex justify-between items-center px-6 py-4 bg-white dark:bg-gray-900 shadow">
        <h1 className="text-2xl font-bold">Add New Course</h1>
        <Button onClick={handleFinalSubmit} disabled={!isFormValid}
          className={!isFormValid ? "opacity-50 cursor-not-allowed" : ""}
        >Submit</Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b px-6 bg-white dark:bg-gray-900 dark:border-none">
        {["curriculum", "landing", "settings"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-6 font-medium text-sm ${activeTab === tab
              ? "text-blue-600 border-b-2 border-blue-500"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {tab[0].toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 w-full px-6 py-4 flex justify-center items-start overflow-y-auto">
        <div className="w-full max-w-4xl">
          {isLoading ? (
            <p className="text-center text-gray-600">Loading course details...</p>
          ) : (
            renderTab()
          )}
        </div>      </div>
    </div>
  );
};

export default AddCoursePage;
