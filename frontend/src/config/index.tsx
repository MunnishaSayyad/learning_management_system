import type { CourseLandingFormData, CourseCurriculumSection } from '../types/index';

// Reusable option type
export interface SelectOption {
  id: string;
  label: string;
}


// Form control component types
export type ComponentType = "input" | "select" | "textarea";

// Form control schema
export interface FormControl {
  name: keyof CourseLandingFormData;
  label: string;
  componentType: ComponentType;
  type?: string;
  placeholder?: string;
  options?: SelectOption[];
}

export const courseLandingInitialFormData: CourseLandingFormData = {
  title: "",
  category: "",
  level: "",
  primaryLanguage: "",
  subtitle: "",
  description: "",
  pricing: "",
  objectives: "",
  welcomeMessage: "",
  image: "",
};

export const languageOptions: SelectOption[] = [
  { id: "english", label: "English" },
  { id: "spanish", label: "Spanish" },
  { id: "french", label: "French" },
  { id: "german", label: "German" },
  { id: "chinese", label: "Chinese" },
  { id: "japanese", label: "Japanese" },
  { id: "korean", label: "Korean" },
  { id: "portuguese", label: "Portuguese" },
  { id: "arabic", label: "Arabic" },
  { id: "russian", label: "Russian" },
];

export const courseLevelOptions: SelectOption[] = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

export const courseCategories: SelectOption[] = [
  { id: "web-development", label: "Web Development" },
  { id: "backend-development", label: "Backend Development" },
  { id: "data-science", label: "Data Science" },
  { id: "machine-learning", label: "Machine Learning" },
  { id: "artificial-intelligence", label: "Artificial Intelligence" },
  { id: "cloud-computing", label: "Cloud Computing" },
  { id: "cyber-security", label: "Cyber Security" },
  { id: "mobile-development", label: "Mobile Development" },
  { id: "game-development", label: "Game Development" },
  { id: "software-engineering", label: "Software Engineering" },
];
export const courseLandingPageFormControls: FormControl[] = [
  {
    name: "title",
    label: "Title",
    componentType: "input",
    type: "text",
    placeholder: "Enter course title",
  },
  {
    name: "category",
    label: "Category",
    componentType: "select",
    placeholder: "Select a category",
    options: courseCategories,
  },
  {
    name: "level",
    label: "Level",
    componentType: "select",
    placeholder: "Select level",
    options: courseLevelOptions,
  },
  {
    name: "primaryLanguage",
    label: "Primary Language",
    componentType: "select",
    placeholder: "Select language",
    options: languageOptions,
  },
  {
    name: "subtitle",
    label: "Subtitle",
    componentType: "input",
    type: "text",
    placeholder: "Enter course subtitle",
  },
  {
    name: "description",
    label: "Description",
    componentType: "textarea",
    placeholder: "Enter course description",
  },
  {
    name: "pricing",
    label: "Pricing",
    componentType: "input",
    type: "number",
    placeholder: "Enter course pricing",
  },
  {
    name: "objectives",
    label: "Objectives",
    componentType: "textarea",
    placeholder: "Enter course objectives",
  },
  {
    name: "welcomeMessage",
    label: "Welcome Message",
    componentType: "textarea",
    placeholder: "Welcome message for students",
  },
];


export const courseCurriculumInitialFormData: CourseCurriculumSection[] = [
  {
    sectionTitle: "",
    lectures: [
      {
        lectureTitle: "",
        fileUrl: "",
        fileType: "",
        freePreview: false,
        public_id: "",
      },
    ],
  },
];

export const sortOptions: SelectOption[] = [
  { id: "price-lowtohigh", label: "Price: Low to High" },
  { id: "price-hightolow", label: "Price: High to Low" },
  { id: "title-atoz", label: "Title: A to Z" },
  { id: "title-ztoa", label: "Title: Z to A" },
];

export const filterOptions: {
  category: SelectOption[];
  level: SelectOption[];
  primaryLanguage: SelectOption[];
} = {
  category: courseCategories,
  level: courseLevelOptions,
  primaryLanguage: languageOptions,
};
