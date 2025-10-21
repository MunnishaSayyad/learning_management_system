import { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { mediaUploadService, mediaDeleteService, mediaBulkUploadService } from '@/api/index';
import MediaProgressbar from '@/components/media-progress-bar';
import VideoPlayer from '@/components/video-player/index';
import { useInstructor } from '@/context/InstructorContext';

import type { CourseCurriculumSection } from '@/types/index';

import * as yup from "yup";

import { toast } from "react-toastify";

export const cirriculumSchema = yup.object({
  sections: yup
    .array()
    .of(
      yup.object().shape({
        sectionTitle: yup.string().required("Section title is required"),
        lectures: yup
          .array()
          .of(
            yup.object().shape({
              lectureTitle: yup.string().required("Lecture title is required"),
              fileUrl: yup.string().url().required("Lecture file URL is required"),
              fileType: yup.string().required("File type is required"),
              freePreview: yup.boolean().required("Preview flag is required"),
              public_id: yup.string().required("Public ID is required"),
            })
          )
          .min(1, "At least one lecture is required")
          .required("Lectures are required"),
      })
    )
    .min(1, "At least one section is required")
    .required("Sections are required"),
});

type CourseCirriculumData = yup.InferType<typeof cirriculumSchema>;

const CourseCurriculum = () => {

  const {
    courseCirriculumFormData,
    setCourseCirriculumFormData,
    mediaUploadProgress,
    setMediaUploadProgress,
    mediaUploadProgressPercentage,
    setMediaUploadProgressPercentage
  } = useInstructor();

  const [uploadingIndex, setUploadingIndex] = useState<{ section: number; lecture: number } | null>(null);
  const [sectionFilled, setSectionFilled] = useState(false);
  const [lectureFilled, setLectureFilled] = useState(false);

  const {
    control,
    handleSubmit,
    trigger,
    reset,
    getValues,
    watch,
    formState: { errors }
  } = useForm<CourseCirriculumData>({
    resolver: yupResolver(cirriculumSchema),
    defaultValues: { sections: courseCirriculumFormData || [] },
  });

  const watchedSections = watch("sections");

  const {
    fields: sections,
    append: appendSection,
    remove: removeSection,
    update: updateSection
  } = useFieldArray({
    control,
    name: "sections",
  });




  useEffect(() => {
    reset({ sections: courseCirriculumFormData });
  }, [courseCirriculumFormData, reset]);


  const generateDefaultSectionTitle = () => {
    const sectionNumbers = sections.map(s =>
      parseInt(s.sectionTitle.replace('Section ', '')) || 0
    );
    const nextNumber = sectionNumbers.length > 0 ? Math.max(...sectionNumbers) + 1 : 1;
    return `Section ${nextNumber}`;
  };

  const generateDefaultLectureTitle = (sectionIndex: number) => {
    const lectureNumbers = sections[sectionIndex]?.lectures.map(l =>
      parseInt(l.lectureTitle.replace('Lecture ', '')) || 0
    );
    const nextNumber = lectureNumbers?.length > 0 ? Math.max(...lectureNumbers) + 1 : 1;
    return `Lecture ${nextNumber}`;
  };
  const handleAddSection = () => {
    appendSection({
      sectionTitle: generateDefaultSectionTitle(),
      lectures: [{
        lectureTitle: 'Lecture 1',
        fileUrl: '',
        fileType: '',
        freePreview: false,
        public_id: ''
      }]
    });
  };

  const handleAddLecture = (sectionIndex: number) => {
    const section = sections[sectionIndex];
    const newLectureTitle = generateDefaultLectureTitle(sectionIndex);

    updateSection(sectionIndex, {
      ...section,
      lectures: [
        ...section.lectures,
        {
          lectureTitle: newLectureTitle,
          fileUrl: '',
          fileType: '',
          freePreview: false,
          public_id: ''
        }
      ]
    });
  };


  const onSubmit = async (data: CourseCirriculumData) => {
    const sanitized = data.sections.map((section) => ({
      ...section,
      lectures: (section.lectures || []).map((lec) => ({
        ...lec,
        freePreview: lec.freePreview ?? false,
        lectureTitle: lec.lectureTitle.trim() || `Lecture ${section.lectures.indexOf(lec) + 1}`,
      })),
      sectionTitle: section.sectionTitle.trim() || `Section ${data.sections.indexOf(section) + 1}`,
    }));

    setCourseCirriculumFormData(sanitized);
  };

  const handleManualSubmit = async (data: CourseCirriculumData) => {
    const isValid = await trigger();
    if (!isValid) return;

    await onSubmit(data);
    toast.success("Curriculum saved successfully!");
  };


  // Add confirmation for section deletion

  const handleBulkUpload = async (files: File[], sectionIndex: number) => {
    const section = sections[sectionIndex];
    let existingLectures = [...section.lectures];

    setUploadingIndex({ section: sectionIndex, lecture: -1 }); // indicate bulk upload

    console.log("existing lectures", existingLectures);

    if (
      existingLectures.length === 1 &&
      existingLectures[0].fileUrl.trim() === ""
      // existingLectures[0].fileType.trim() === "" &&
      // existingLectures[0].public_id.trim() === ""
    ) {
      existingLectures = [];
    }


    const formData = new FormData();
    files.forEach(file => formData.append("files", file)); // ✅ append each file under 'files'

    try {
      setMediaUploadProgress(true);

      const response = await mediaBulkUploadService(formData, setMediaUploadProgressPercentage);

      const uploadedFiles = response.data?.data || [];
      console.log(uploadedFiles);

      const newLectures = uploadedFiles.map((fileData: any, index: number) => ({
        lectureTitle: `Lecture ${existingLectures.length + index + 1}`,
        fileUrl: fileData.secure_url || fileData.url,
        fileType: files[index].type,
        freePreview: false,
        public_id: fileData.public_id
      }));

      updateSection(sectionIndex, {
        ...section,
        lectures: [...existingLectures, ...newLectures]
      });

      toast.success(`${newLectures.length} lectures uploaded!`);
    } catch (e) {
      console.error("Bulk upload failed:", e);
      toast.error("Bulk upload failed");
    } finally {
      setMediaUploadProgress(false);
      setUploadingIndex(null);
      await onSubmit(getValues());

    }
  };


  const handleFileUpload = async (file: File, sectionIndex: number, lectureIndex: number) => {
    const formData = new FormData();
    formData.append('file', file);
    setUploadingIndex({ section: sectionIndex, lecture: lectureIndex });

    try {
      setMediaUploadProgress(true);
      const response = await mediaUploadService(formData, setMediaUploadProgressPercentage);
      const uploadedUrl = response.data?.data?.secure_url || response.data?.data?.url;
      const public_id = response.data?.data?.public_id;
      const fileType = file.type;

      const allValues = getValues(); // ✅ Fresh form values
      const section = allValues.sections[sectionIndex];
      const updatedLectures = [...section.lectures];

      updatedLectures[lectureIndex] = {
        ...updatedLectures[lectureIndex],
        fileUrl: uploadedUrl,
        fileType,
        public_id
      };

      updateSection(sectionIndex, {
        ...section,
        lectures: updatedLectures
      });
    } catch (e) {
      console.error('Upload error:', e);
    } finally {
      setMediaUploadProgress(false);
      setUploadingIndex(null);
      await onSubmit(getValues());

    }
  };

  const handleReplaceFile = async (sectionIndex: number, lectureIndex: number) => {
    const publicId = sections[sectionIndex].lectures[lectureIndex].public_id;
    if (!publicId) return;

    try {
      const deleted = await mediaDeleteService(publicId);
      if (deleted.success) {
        const allValues = getValues();
        const section = allValues.sections[sectionIndex];
        const updatedLectures = [...section.lectures];
        updatedLectures[lectureIndex] = {
          ...updatedLectures[lectureIndex],
          fileUrl: '',
          fileType: '',
          public_id: ''
        };

        updateSection(sectionIndex, {
          ...section,
          lectures: updatedLectures
        });
      }
    } catch (error) {
      console.error('Replace failed:', error);
    } finally {
      await onSubmit(getValues());

    }
  };



  // Add confirmation for section deletion
  const confirmDeleteSection = async (sectionIndex: number) => {
    if (window.confirm('Are you sure you want to delete this section and all its lectures?')) {
      await handleDeleteSection(sectionIndex);
      await onSubmit(getValues());

    }
  };

  // Add confirmation for lecture deletion
  const confirmDeleteLecture = async (sectionIndex: number, lectureIndex: number) => {
    if (window.confirm('Are you sure you want to delete this lecture?')) {
      await handleDeleteLecture(sectionIndex, lectureIndex);
      await onSubmit(getValues());

    }
  };


  const handleDeleteLecture = async (sectionIndex: number, lectureIndex: number) => {
    const lecture = sections[sectionIndex].lectures[lectureIndex];
    // Delete media file if exists
    if (lecture.public_id) {
      try {
        await mediaDeleteService(lecture.public_id);
      } catch (error) {
        console.error('Error deleting media:', error);
      } finally {
        await onSubmit(getValues());

      }
    }

    // If this is the last lecture, remove the entire section
    if (sections[sectionIndex].lectures.length === 1) {
      removeSection(sectionIndex);
    } else {
      // Otherwise just remove the lecture
      const section = sections[sectionIndex];
      const updatedLectures = [...section.lectures];
      updatedLectures.splice(lectureIndex, 1);

      updateSection(sectionIndex, {
        ...section,
        lectures: updatedLectures
      });
    }
  };

  const handleDeleteSection = async (sectionIndex: number) => {
    const section = sections[sectionIndex];

    const deletePromises = section.lectures.map(lecture => {
      if (lecture.public_id) {
        return mediaDeleteService(lecture.public_id).catch(error => {
          console.error('Error deleting media:', error);
          return null;
        });
      }
      return Promise.resolve(null);
    });

    try {
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting some media files:', error);
    }

    // Remove the section
    removeSection(sectionIndex);
  };

  const isLastLectureValid = (lectures: CourseCurriculumSection["lectures"]) => {
    if (!lectures || lectures.length === 0) {
      setLectureFilled(false);
      return false;
    }

    const last = lectures[lectures.length - 1];
    const isValid = last.lectureTitle?.trim() &&
      last.fileUrl?.trim() &&
      last.fileType?.trim() &&
      last.public_id?.trim();

    setLectureFilled(!!isValid);
    return isValid;
  };

  const isLastSectionValid = () => {
    if (watchedSections.length === 0) {
      setSectionFilled(true);
      return true;
    }

    const lastSection = watchedSections[watchedSections.length - 1];
    const isValid = lastSection?.sectionTitle?.trim() &&
      lastSection?.lectures?.length > 0 &&
      isLastLectureValid(lastSection.lectures);

    setSectionFilled(!!isValid);
    return isValid;
  };

  // Add this useEffect to watch for changes
  useEffect(() => {
    isLastSectionValid();
  }, [watchedSections]);
  return (


    <Card className="w-full shadow-md dark:shadow-lg dark:shadow-gray-800">
      <CardHeader className="flex items-center flex-row justify-between gap-4">
        <CardTitle className="text-lg font-semibold text-gray-800  dark:text-white ">
          Course Curriculum
        </CardTitle>
        <Button
          type="button"
          onClick={handleAddSection}
          disabled={!sectionFilled}
          className={!sectionFilled ? "opacity-50 cursor-not-allowed" : ""}
          title={!sectionFilled ? "Please complete the current section before adding a new one" : ""}
        >
          + Add Section
        </Button>
      </CardHeader>


      <form onSubmit={handleSubmit(handleManualSubmit)} className={mediaUploadProgress ? "pointer-events-none opacity-70" : ""}>
        <CardContent className="space-y-10">
          {/* Add save notification */}

          {sections.map((section, sectionIndex) => (

            <div
              key={section.id}
              className=" p-4 space-y-6 shadow-sm dark:shadow-md dark:shadow-gray-800 bg-white dark:bg-gray-900 mt-6 rounded-lg z-10 relative"
            >
              <div className="flex items-center gap-6 p-3 w-full dark:bg-gray-900">

                <h3 className="font-semibold text-gray-700 whitespace-nowrap  dark:text-white ">
                  Section {sectionIndex + 1}:
                </h3>
                <Controller
                  name={`sections.${sectionIndex}.sectionTitle`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Section Title"

                      className="border border-gray-300 rounded-md"
                    />
                  )}
                />


                {errors.sections?.[sectionIndex]?.sectionTitle && (
                  <p className="text-sm text-red-600">{errors.sections[sectionIndex].sectionTitle?.message}</p>
                )}
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="video/*,image/*"
                    multiple
                    className="hidden"
                    id={`bulk-upload-${sectionIndex}`}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 0) {
                        handleBulkUpload(files, sectionIndex);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      document.getElementById(`bulk-upload-${sectionIndex}`)?.click();
                    }}
                  >
                    Bulk Upload Lectures
                  </Button>
                  {uploadingIndex?.section === sectionIndex && uploadingIndex?.lecture === -1 && mediaUploadProgress && (
                    <MediaProgressbar isMediaUploading={mediaUploadProgress} progress={mediaUploadProgressPercentage} />
                  )}
                </div>

              </div>

              {section.lectures.map((lecture, lectureIndex) => {
                const file = lecture.fileUrl;
                const fileType = lecture.fileType;

                return (

                  <div
                    key={lectureIndex}
                    className="rounded p-4 space-y-4 shadow-sm dark:shadow-md dark:shadow-gray-800 bg-gray-50 dark:bg-gray-900 transition-shadow hover:shadow-md dark:hover:shadow-lg"
                  >


                    <div className="flex items-center gap-6 p-3 w-full dark:bg-gray-900">
                      <h3 className="font-semibold text-gray-700 dark:text-white whitespace-nowrap">
                        Lecture {lectureIndex + 1}:
                      </h3>
                      <Controller
                        name={`sections.${sectionIndex}.lectures.${lectureIndex}.lectureTitle`}
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder={`Lecture ${lectureIndex + 1}`}
                            className="max-w-96 border border-gray-300 rounded-md"
                          />
                        )}
                      />
                      {errors.sections?.[sectionIndex]?.lectures?.[lectureIndex]?.lectureTitle && (
                        <p className="text-sm text-red-600">
                          {errors.sections[sectionIndex].lectures?.[lectureIndex]?.lectureTitle?.message}
                        </p>
                      )}
                      <Button
                        type="button"
                        onClick={() => confirmDeleteLecture(sectionIndex, lectureIndex)}
                      >
                        Delete Lecture
                      </Button>
                    </div>

                    {uploadingIndex?.section === sectionIndex &&
                      uploadingIndex?.lecture === lectureIndex &&
                      mediaUploadProgress ? (
                      <MediaProgressbar isMediaUploading={mediaUploadProgress} progress={mediaUploadProgressPercentage} />
                    ) : file ? (
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-semibold">Preview:</p>
                          {fileType.startsWith('video/') ? (
                            <VideoPlayer url={file} width="450px" height="200px" />
                          ) : fileType.startsWith('image/') && (
                            <img src={file} className="max-h-[300px] rounded object-contain" />
                          )}
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <Button type="button" variant="secondary" onClick={() => handleReplaceFile(sectionIndex, lectureIndex)}>
                            Replace File
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const updatedLectures = [...section.lectures];
                              updatedLectures[lectureIndex] = {
                                ...updatedLectures[lectureIndex],
                                fileUrl: '',
                                fileType: '',
                                public_id: ''
                              };

                              updateSection(sectionIndex, {
                                ...section,
                                lectures: updatedLectures
                              });
                            }}
                          >
                            Remove File
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Input
                        type="file"
                        accept="video/*,image/*"
                        className="border border-gray-300 rounded-md"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, sectionIndex, lectureIndex);
                        }}
                      />
                    )}

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={lecture.freePreview}
                        onCheckedChange={(checked) => {
                          const updatedLectures = [...section.lectures];
                          updatedLectures[lectureIndex] = {
                            ...updatedLectures[lectureIndex],
                            freePreview: checked
                          };

                          updateSection(sectionIndex, {
                            ...section,
                            lectures: updatedLectures
                          });
                        }}
                      />
                      <Label>Free Preview</Label>
                    </div>
                  </div>
                );
              })}

              <Button
                type="button"
                disabled={!lectureFilled}
                onClick={() => handleAddLecture(sectionIndex)}
                className={!lectureFilled ? "opacity-50 cursor-not-allowed" : ""}
                title={!lectureFilled ? "Please complete the current lecture before adding a new one" : ""}
              >
                + Add Lecture
              </Button>


              <Button
                type="button"
                variant="destructive"
                onClick={() => confirmDeleteSection(sectionIndex)}
              >
                Delete Section
              </Button>
            </div>
          ))}
          <div className="flex justify-end">
            <Button type="submit">Save Curriculum</Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
};

export default CourseCurriculum;
