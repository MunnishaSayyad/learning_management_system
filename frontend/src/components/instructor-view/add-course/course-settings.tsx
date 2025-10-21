import MediaProgressbar from "@/components/media-progress-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mediaUploadService } from "@/api/index";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useInstructor } from "@/context/InstructorContext";

// ✅ Validation schema using Yup
export const ImageSchema = yup.object().shape({
  image: yup.string().url("Must be a valid image URL").required("Course image is required"),
});

// ✅ Type derived from the schema
type LandingFormType = yup.InferType<typeof ImageSchema>;

const CourseSettings = () => {
  const {
    courseLandingFormData,
    setCourseLandingFormData,
    mediaUploadProgress,
    setMediaUploadProgress,
    mediaUploadProgressPercentage,
    setMediaUploadProgressPercentage,
  } = useInstructor();

  const {
    setValue,
    formState: { errors },
  } = useForm<LandingFormType>({
    resolver: yupResolver(ImageSchema),
    defaultValues: {
      image: courseLandingFormData.image || "",
    },
  });

  // ✅ File upload handler
  const handleImageUploadChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedImage = event.target.files?.[0];

    if (selectedImage) {
      const imageFormData = new FormData();
      imageFormData.append("file", selectedImage);

      try {
        setMediaUploadProgress(true);
        const response = await mediaUploadService(
          imageFormData,
          setMediaUploadProgressPercentage
        );

        if (response.data.success) {
          const uploadedUrl = response.data.data?.url || response.data.data?.secure_url;

          setCourseLandingFormData({
            ...courseLandingFormData,
            image: uploadedUrl,
          });

          setValue("image", uploadedUrl); // ✅ Set it in form
        }
      } catch (e) {
        console.log("Upload failed", e);
      } finally {
        setMediaUploadProgress(false);
      }
    }
  };



  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Settings</CardTitle>
      </CardHeader>

      <div className="p-4">
        {mediaUploadProgress && (
          <MediaProgressbar
            isMediaUploading={mediaUploadProgress}
            progress={mediaUploadProgressPercentage}
          />
        )}
      </div>

      <CardContent>
        <form className="space-y-4">
          <div className="flex flex-col gap-3">
            <Label htmlFor="image">Upload Course Image</Label>

            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageUploadChange}
            />

            {errors.image && (
              <p className="text-sm text-red-600">{errors.image.message}</p>
            )}

            {courseLandingFormData?.image && (
              <img
                src={courseLandingFormData.image}
                alt="Uploaded Preview"
                className="max-w-sm rounded mt-2"
              />
            )}
          </div>

        </form>

      </CardContent>
    </Card>
  );
};

export default CourseSettings;
