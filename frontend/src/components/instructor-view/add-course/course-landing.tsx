import { useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useInstructor } from "@/context/InstructorContext";

import {
  courseLandingPageFormControls,
  type FormControl,
} from "@/config/index";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";

// ✅ Schema
export const courseLandingSchema = yup.object({
  title: yup.string().required("Course title is required"),
  subtitle: yup.string().required("Subtitle is required"),
  description: yup.string().required("Description is required"),
  category: yup.string().required("Category is required"),
  level: yup.string().required("Level is required"),
  primaryLanguage: yup.string().required("Primary language is required"),
  pricing: yup.string().required("Pricing information is required"),
  objectives: yup.string().required("Course objectives are required"),
  welcomeMessage: yup.string().required("Welcome message is required"),
});

export type CourseLandingData = yup.InferType<typeof courseLandingSchema>;

function CourseLanding() {
  const { courseLandingFormData, setCourseLandingFormData } = useInstructor();

  const {
    register,
    setValue,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CourseLandingData>({
    resolver: yupResolver(courseLandingSchema),
    defaultValues: courseLandingFormData,
  });

  // ✅ Reset form on external data update
  useEffect(() => {
    reset(courseLandingFormData);
  }, [courseLandingFormData, reset]);


  const onSubmit = useCallback((data: CourseLandingData) => {
    const trimmedData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, value.trim()])
    ) as CourseLandingData;

    const isComplete = Object.values(trimmedData).every(
      (v) => typeof v === "string" && v !== ""
    );
    console.log("trimmed Data:", trimmedData)

    if (isComplete) {
      setCourseLandingFormData(trimmedData);
      console.log("Auto-saved (trimmed):", trimmedData);
    }
  }, [setCourseLandingFormData]);

  useEffect(() => {
    const subscription = watch((value, info) => {
      if (info?.type === "change") {
        onSubmit(value as CourseLandingData);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, onSubmit]);

  // ✅ Manual save with toast
  const handleManualSubmit = (data: CourseLandingData) => {
    const trimmedData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, value.trim()])
    ) as CourseLandingData;
    console.log("trimmed Data:", trimmedData)

    setCourseLandingFormData(trimmedData);
    toast.success("Course form saved!");
  };


  // ✅ Render Fields
  const renderField = (field: FormControl) => {
    const { name, label, componentType, type, placeholder, options } = field;

    switch (componentType) {
      case "input":
        return (
          <div key={name}>
            <Label>{label}</Label>
            <Input
              {...register(name as keyof CourseLandingData)}
              type={type}
              placeholder={placeholder}
            />
            {errors[name as keyof CourseLandingData] && (
              <p className="text-sm text-red-600">
                {errors[name as keyof CourseLandingData]?.message as string}
              </p>
            )}
          </div>
        );

      case "textarea":
        return (
          <div key={name}>
            <Label>{label}</Label>
            <Textarea
              {...register(name as keyof CourseLandingData)}
              placeholder={placeholder}
            />
            {errors[name as keyof CourseLandingData] && (
              <p className="text-sm text-red-600">
                {errors[name as keyof CourseLandingData]?.message as string}
              </p>
            )}
          </div>
        );

      case "select":
        return (
          <div key={name}>
            <Label>{label}</Label>
            <Select
              onValueChange={(value) => {
                setValue(name as keyof CourseLandingData, value, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
              defaultValue={courseLandingFormData[name] as string}
            >
              <SelectTrigger className="bg-white border border-gray-300 dark:bg-gray-900">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {options?.map((opt) => (
                  <SelectItem
                    key={opt.id}
                    value={opt.id}
                    className="hover:bg-blue-100 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors[name as keyof CourseLandingData] && (
              <p className="text-sm text-red-600">
                {errors[name as keyof CourseLandingData]?.message as string}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Landing Page</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(handleManualSubmit)}>
        <CardContent className="space-y-6">


          <div className="grid grid-cols-1 gap-6">
            {courseLandingPageFormControls.map(renderField)}
          </div>

          <div className="flex justify-end">
            <Button type="submit">Save Course</Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}

export default CourseLanding;
