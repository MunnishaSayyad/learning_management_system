export type Role = "admin" | "student" | "instructor";

export interface User {
  id: string;
  username: string;
  useremail: string;
  role: Role;
  token?: string;
}

export interface CourseLandingFormData {
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: string;
  primaryLanguage: string;
  pricing: string;
  objectives: string;
  welcomeMessage: string;
  image?: string;
}


export interface CourseCurriculumSection {
  sectionTitle: string;
  lectures: {
    lectureTitle: string;
    fileUrl: string;
    fileType: string;
    freePreview: boolean;
    public_id: string;
  }[];
}

export interface SignFormData {
  username?: string;
  useremail: string;
  password: string;
}

export interface GoogleUserData {
  username: string;
  useremail: string;
  googleId: string;
}

export interface CourseData {
  _id?: string;
  instructorId: string;
  instructorName: string;
  instructorEmail: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: string;
  primaryLanguage: string;
  pricing: string;
  objectives: string;
  welcomeMessage: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
  students?: {
    studentId: string;
    studentName: string;
    studentEmail: string;
  }[];
  curriculum: Array<{
    sectionTitle: string;
    lectures: Array<{
      lectureTitle: string;
      fileUrl?: string;
      fileType?: string;
      freePreview?: boolean;
      public_id?: string;
    }>;
  }>;
}

export interface Lecture {
  _id?: string;
  lectureTitle: string;
  fileUrl?: string;
  fileType?: string;
  freePreview?: boolean;
  public_id?: string;
}

export interface CurriculumItem {
  _id?: string;
  sectionTitle: string;
  lectures: Lecture[];
}

export interface order {
  userId: string;
  userName: string;
  userEmail: string;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  orderDate: Date;
  paymentId: string;
  payerId: string;
  instructorId: string;
  instructorName: string;
  courseImage: string;
  courseTitle: string;
  courseId: string;
  coursePricing: string;
}

export interface paymentCapture {
  paymentId: string;
  payerId: string,
  orderId: string,
}


export interface EnrolledCourses {
  courseId: string,
  courseImage: string,
  instructorId: string,
  instructorName: string,
  title: string,
  _id: string,

}

//student course progress


export interface Lecture {
  _id?: string;
  lectureTitle: string;
  fileUrl?: string;
  fileType?: string;
  freePreview?: boolean;
  public_id?: string;
  progressValue?: number;
}

export interface CurriculumSection {
  _id: string;
  sectionTitle: string;
  lectures: Lecture[];
}



export interface CourseDetails {
  _id: string;
  title: string;
  description: string;
  curriculum: CurriculumSection[];
}

export interface LectureProgress {
  lectureId: string;
  viewed: boolean;
}

export interface CourseProgress {
  courseDetails: CourseDetails;
  progress: LectureProgress[];
  completed?: boolean;
  isPurchased?: boolean;
}