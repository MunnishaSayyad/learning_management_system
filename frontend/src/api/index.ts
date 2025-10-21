import instance from "./axiosInstance";

import type { SignFormData, GoogleUserData,CourseData, order,paymentCapture} from "@/types";

//auth routes
export const signIn = (formData: SignFormData) => {
  return instance.post("/auth/signin", formData);
};

export const signUp = (formData: SignFormData) => {
  return instance.post("/auth/signup", formData);
};

export const googleAuth = (formData: GoogleUserData) => {
  return instance.post("/auth/google", formData);
};

export const getUserProfile = (id:string) => {
  return instance.get(`/auth/profile/${id}`);
};

//cloudinary routes
export const mediaUploadService = (
  fileData: FormData,
  onProgressCallback: (progress: number) => void
) => {
  return instance.post("/media/upload", fileData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgressCallback(percent);
      }
    },
  });
};

export const mediaBulkUploadService = (
  fileData: FormData,
  onProgressCallback: (progress: number) => void

) => {
  return instance.post("/media/bulk-upload", fileData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgressCallback(percent);
      }
    },
  });
  
}

export async function mediaDeleteService(id:string) {
  const { data } = await instance.delete(`/media/delete/${id}`);

  return data;
}

//instructor course routes
export const createNewCourse = (formData: CourseData) => {
  return instance.post("/instructor/courses/add", formData);
};
export const fetchCourseDetails = (id: string) => {
  return instance.get(`/instructor/courses/get/details/${id}`);
};
export const updateCourseById = (id: string, updatedData: Partial<CourseData>) => {
  return instance.patch(`/instructor/courses/update/${id}`, updatedData);
};
export const getCourses = () => {
  return instance.get("/instructor/courses/get",);
};
export const deleteCourseById = (id: string) => {
  return instance.delete(`/instructor/courses/delete/${id}`);
};


//student course routes
export const fetchStudentViewCourses = (query?: string) => {
  const finalQuery = query?.startsWith("?") ? query : `?${query}`;
  return instance.get(`/student/course/get${finalQuery || ""}`);
};
export const fetchStudentViewCourseDetails = (courseId: string) => {
  return instance.get(`/student/course/get/details/${courseId}`);
};
export const checkCousePurchaseInfo = (courseId: string, studentId:string) => {
  return instance.get(`/student/course/purchase-info/${courseId}/${studentId}`);
};


//student course order routes
export const createPayment = (data:order) => {
  return instance.post('/student/order/create', data);
}
export const capturePayment = (data:paymentCapture ) => {
  return instance.post('/student/order/capture',data);

}

//student enrolled courses routes
export const fetchStudentEnrolledCourses = (studentId: string) => {
  return instance.get(`/student/enrolled-courses/get/${studentId}`)
}


//student course progress route
export const getCurrentCourseProgress = (studentId: string, courseId:string) => {
  return instance.get(`/student/course-progress/get/${studentId}/${courseId}`);
  
};

export const markCurrentLectureAsViewed = (studentId: string, courseId:string,lectureId:string) => {
  return instance.post(`/student/course-progress/mark-lecture-viewed`,{studentId,courseId,lectureId});
  
};

export const resetCurrentCourseProgress = (studentId: string, courseId:string) => {
  return instance.post(`/student/course-progress/reset-progress`,{studentId,courseId});
  
};

//instructor notifications
export const getNotifications = (id: string) => {
  return instance.get(`/instructor/notifications/get/${id}`);
};