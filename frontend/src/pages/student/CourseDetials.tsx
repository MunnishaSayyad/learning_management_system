import { useStudent } from "@/context/StudentContext";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Globe, Lock, PlayCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VideoPlayer from "@/components/video-player";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useAuth } from "@/context/AuthContext";
import { createPayment } from "@/api";

import type { Lecture, CurriculumItem } from "@/types";

const StudentViewCourseDetialsPage = () => {
  const { studentViewCourseDetails, getCourse, loading, checkPurchasedCourse } = useStudent();
  const { id } = useParams();
  const { user } = useAuth();
  const [load, setload] = useState(false);

  const [showFreePreviewDialog, setShowFreePreviewDialog] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [currentLecture, setCurrentLecture] = useState<Lecture | null>(null);
  const [approvalUrl, setApprovalUrl] = useState('');

  console.log(studentViewCourseDetails?.curriculum);

  const navigate = useNavigate();

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, []);

  const handleLectureClick = useCallback((lecture: Lecture) => {
    if (lecture.freePreview && lecture.fileUrl) {
      setCurrentLecture(lecture);
      setShowFreePreviewDialog(true);
    }
  }, []);

  const handleSetFreePreview = useCallback((lecture: Lecture) => {
    if (lecture.fileUrl) {
      setCurrentLecture(lecture);
    }

  }, []);

  useEffect(() => {
    async function load() {
      if (id) {
        const checkcoursePurchase = await checkPurchasedCourse(id);
        console.log("checkcoursePurchase", checkcoursePurchase);
        if (checkcoursePurchase?.success && checkcoursePurchase?.data) {
          navigate(`/course-progress/${id}`)
          return;
        }
        getCourse(id)
      }
    }
    load()
  }, [id]);

  const handleCreatePayment = async () => {
    setload(true);
    if (
      !user?.id ||
      !user?.username ||
      !user?.useremail ||
      !studentViewCourseDetails?._id ||
      !studentViewCourseDetails?.title ||
      !studentViewCourseDetails?.pricing ||
      !studentViewCourseDetails?.instructorId ||
      !studentViewCourseDetails?.instructorName ||
      !studentViewCourseDetails?.image
    ) {
      console.error("Missing required fields for payment");
      return;
    }
    const paymentPayload = {
      userId: user?.id,
      userName: user?.username,
      userEmail: user?.useremail,
      orderStatus: 'pending',
      paymentMethod: 'paypal',
      paymentStatus: 'intiated',
      orderDate: new Date(),
      paymentId: '',
      payerId: '',
      instructorId: studentViewCourseDetails?.instructorId,
      instructorName: studentViewCourseDetails?.instructorName,
      courseImage: studentViewCourseDetails?.image,
      courseTitle: studentViewCourseDetails?.title,
      courseId: studentViewCourseDetails?._id,
      coursePricing: studentViewCourseDetails?.pricing,
    }
    const response = await createPayment(paymentPayload);
    if (response?.data?.success) {
      sessionStorage.setItem("currentorderId", JSON.stringify(response?.data?.data?.orderId))
      setApprovalUrl(response?.data?.data?.approveUrl)
    }
    setload(false)
  }


  const freePreviewLecture = studentViewCourseDetails?.curriculum
    ?.flatMap((section) => section.lectures || [])
    ?.find((lecture) => lecture.freePreview);

  const previewUrl = freePreviewLecture?.fileUrl || "";
  const previewType = freePreviewLecture?.fileType || "";

  if (loading) return <Skeleton className="w-full h-[400px]" />;


  if (approvalUrl !== '') {
    window.location.href = approvalUrl;
  }

  return (
    <div className="min-h-screen bg-gray-100"> {/* Add this wrapper */}

      <div className="bg-gray-900 text-white p-8 rounded-t-lg">

        <h1 className="text-3xl font-bold mb-4">
          {studentViewCourseDetails?.title}
        </h1>
        <p className="text-xl mb-4">{studentViewCourseDetails?.subtitle}</p>
        <div className="flex items-center space-x-4 mt-2 text-sm">
          <span>Created by {studentViewCourseDetails?.instructorName}</span>
          <span>Created On {studentViewCourseDetails?.createdAt?.split("T")[0]}</span>
          <span>Updated On {studentViewCourseDetails?.updatedAt?.split("T")[0]}</span>
          <span className="flex items-center">
            <Globe className="mr-1 h-4 w-4" />
            {studentViewCourseDetails?.primaryLanguage}
          </span>
          <span>
            {studentViewCourseDetails?.students?.length ?? 0}{" "}
            {(studentViewCourseDetails?.students?.length ?? 0) <= 1 ? "Student" : "Students"}
          </span>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-8 p-6 dark:bg-gray-500">
        <main className="flex-grow">
          <Card className="mb-8 dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">
                What you'll learn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {studentViewCourseDetails?.objectives?.split(',').map((objective: string, index: number) => (
                  <li key={index} className="flex items-center dark:text-gray-300">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-400" />
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="mb-8 dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">
                Course Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              {studentViewCourseDetails?.description}
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Course Curriculum</CardTitle>
            </CardHeader>
            <CardContent>
              {(studentViewCourseDetails?.curriculum as CurriculumItem[])?.map((curriculumItem, index) => (
                <div key={curriculumItem._id} className="mb-6">
                  <div
                    className="flex items-center justify-between p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => toggleSection(curriculumItem?._id || index.toString())}
                  >
                    <h1 className="text-lg font-semibold dark:text-white">
                      {curriculumItem?.sectionTitle}
                    </h1>
                    {expandedSections[curriculumItem._id || index.toString()] ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>

                  {expandedSections[curriculumItem._id || index.toString()] && (
                    <ul className="mt-2">
                      {curriculumItem?.lectures?.map((lecture: Lecture, lectureIndex: number) => (
                        <li
                          className={`
                            flex items-center p-2 rounded
                            ${lecture?.freePreview
                              ? 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                              : 'cursor-not-allowed opacity-70'
                            }
                          `}
                          key={lectureIndex}
                          onClick={() => handleLectureClick(lecture)}
                        >
                          {lecture.freePreview ?
                            <PlayCircle className="mr-2 h-5 w-5 text-blue-500" /> :
                            <Lock className="mr-2 h-5 w-5 text-gray-400" />
                          }
                          <span className="dark:text-gray-300">{lecture?.lectureTitle}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </main>

        <aside className="w-full md:w-[500px]">
          <Card className="sticky top-4 dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="aspect-video mb-4 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                {currentLecture ? (
                  currentLecture.fileType?.startsWith("video/") ? (
                    <VideoPlayer url={currentLecture?.fileUrl || ""} width="100%" height="300px" />
                  ) : currentLecture.fileType?.startsWith("image/") && (
                    <img
                      src={currentLecture.fileUrl}
                      alt="Preview"
                      className="max-h-[300px] rounded object-contain"
                    />
                  )
                ) : previewUrl ? (
                  previewType.startsWith("video/") ? (
                    <VideoPlayer url={previewUrl} width="100%" height="300px" />
                  ) : previewType.startsWith("image/") && (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-[300px] rounded object-contain"
                    />
                  )
                ) : (
                  <span className="text-gray-400">No content available</span>
                )}
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold dark:text-white">
                  ${studentViewCourseDetails?.pricing}
                </span>
                <Button onClick={handleCreatePayment} className={`w-full mt-4 bg-black text-white rounded hover:bg-black ${load ? 'cursor-not-allowed bg-black-100' : ""}`}>
                  {load ? "Enrolling" : "Enroll Now"}

                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      <Dialog
        open={showFreePreviewDialog}
        onOpenChange={() => {
          setShowFreePreviewDialog(false);
        }}
      >
        <DialogContent
          className="max-w-[900px] w-full max-h-[90vh] overflow-y-auto rounded-md bg-white"
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {currentLecture?.lectureTitle ? (
                <>
                  {
                    studentViewCourseDetails?.curriculum?.find((section) =>
                      section.lectures.includes(currentLecture)
                    )?.sectionTitle
                  }

                  <br />
                  Lecture: {currentLecture?.lectureTitle}
                </>
              ) : (
                "Course Preview"
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="w-full h-[350px] mb-4 flex items-center justify-center rounded bg-gray-100">
            {currentLecture?.fileType?.startsWith("video/") && currentLecture.fileUrl ? (
              <VideoPlayer url={currentLecture.fileUrl} width="100%" height="100%" />
            ) : currentLecture?.fileType?.startsWith("image/") ? (
              <img
                src={currentLecture.fileUrl}
                alt="Preview"
                className="max-h-[100%] max-w-full rounded object-contain"
              />
            ) : (
              <span className="text-gray-400">No preview available</span>
            )}
          </div>

          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2">

            {
              (studentViewCourseDetails?.curriculum as CurriculumItem[])?.map((section, index: number) => (
                <div key={index}>
                  {section.lectures
                    .filter((lecture: Lecture) => lecture.freePreview)
                    .map((lecture: Lecture, i: number) => (<p
                      key={i}
                      className={`flex items-center gap-1 cursor-pointer text-[16px] font-medium hover:text-blue-600 ${currentLecture?._id === lecture._id ? "text-blue-600 font-semibold underline" : ""
                        }`}
                      onClick={() => handleSetFreePreview(lecture)}
                    >
                      {currentLecture?._id === lecture._id && <span>🎬</span>}
                      <h3 className="font-semibold mb-1">{section?.sectionTitle}:</h3>

                      {lecture?.lectureTitle}
                    </p>

                    ))}
                </div>
              ))
            }

          </div>

          <DialogFooter className="sm:justify-start mt-4">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>



      </Dialog>
    </div>
  );
};

export default StudentViewCourseDetialsPage;

