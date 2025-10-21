import { createContext, useState, useContext } from "react";
import { courseCurriculumInitialFormData, courseLandingInitialFormData } from "@/config/index";
import type { CourseLandingFormData, CourseCurriculumSection } from '../types/index';
import type { CourseData } from "../types/index";
export interface InstructorContextProps {
  courseLandingFormData: CourseLandingFormData;
  setCourseLandingFormData: React.Dispatch<React.SetStateAction<CourseLandingFormData>>;
  courseCirriculumFormData: CourseCurriculumSection[];
  setCourseCirriculumFormData: React.Dispatch<React.SetStateAction<CourseCurriculumSection[]>>;
  mediaUploadProgress: boolean;
  setMediaUploadProgress: React.Dispatch<React.SetStateAction<boolean>>;
  mediaUploadProgressPercentage: number;
  setMediaUploadProgressPercentage: React.Dispatch<React.SetStateAction<number>>;
  instructorCourseList: CourseData[],
  setInstructorCourseList: React.Dispatch<React.SetStateAction<CourseData[]>>;
  currentEditedCourseId: string;
  setCurrentEditedCourseId: React.Dispatch<React.SetStateAction<string>>;
}


const InstructorContext = createContext<InstructorContextProps>({} as InstructorContextProps);

export const InstructorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courseLandingFormData, setCourseLandingFormData] = useState<CourseLandingFormData>(courseLandingInitialFormData);

  const [courseCirriculumFormData, setCourseCirriculumFormData] = useState<CourseCurriculumSection[]>(courseCurriculumInitialFormData);

  const [mediaUploadProgress, setMediaUploadProgress] = useState(false);
  const [mediaUploadProgressPercentage, setMediaUploadProgressPercentage] =
    useState(0);

  const [instructorCourseList, setInstructorCourseList] = useState<CourseData[]>([]);
  const [currentEditedCourseId, setCurrentEditedCourseId] = useState<string>("");

  console.log(instructorCourseList)

  return (
    <InstructorContext.Provider
      value={{
        courseLandingFormData,
        setCourseLandingFormData,
        courseCirriculumFormData,
        setCourseCirriculumFormData,
        mediaUploadProgress,
        setMediaUploadProgress,
        mediaUploadProgressPercentage,
        setMediaUploadProgressPercentage,
        instructorCourseList,
        setInstructorCourseList,
        currentEditedCourseId,
        setCurrentEditedCourseId
      }}
    >
      {children}
    </InstructorContext.Provider>
  );
};

export const useInstructor = () => useContext(InstructorContext);