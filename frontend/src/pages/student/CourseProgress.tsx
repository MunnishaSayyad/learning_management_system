
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check, Play } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCurrentCourseProgress,
  markCurrentLectureAsViewed,
  resetCurrentCourseProgress,
} from "@/api";
import { useStudent } from "@/context/StudentContext";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Confetti from "react-confetti";
import {
  Tabs,
  TabsContent,
  TabsTrigger,
  TabsList,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import VideoPlayer from "@/components/video-player";
import type { Lecture, LectureProgress } from "@/types";



function StudentViewCourseProgressPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { studentCurrentCourseProgress, setStudentCurrentCourseProgress } = useStudent()

  const { user } = useAuth();
  const [lockCourse, setLockCourse] = useState(false);
  const [currentLecture, setCurrentLecture] = useState<Lecture | null>(null);
  const [showCourseCompleteDialog, setShowCompleteCourseDialog] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);
  const studentId = user?.id || "";

  const fetchStudentCourseProgress = async () => {
    if (!id) return;
    try {
      const res = await getCurrentCourseProgress(studentId, id);
      if (res?.data?.success) {
        const progressData = res?.data?.data;
        if (!progressData?.isPurchased) {
          setLockCourse(true);
          return;
        }

        setStudentCurrentCourseProgress({
          courseDetails: progressData.courseDetails,
          progress: progressData.progress,
        });

        const firstLecture = progressData.courseDetails?.curriculum?.[0]?.lectures?.[0];
        if (progressData?.completed) {
          setShowCompleteCourseDialog(true);
          setShowConfetti(true);
          return;
        }

        if (progressData?.progress.length === 0) {
          if (firstLecture) setCurrentLecture(firstLecture);
        } else {
          const lastViewedIndex = progressData.progress.reduceRight(
            (acc: number, obj: LectureProgress, index: number) => {
              return acc === -1 && obj.viewed ? index : acc;
            },
            -1
          );

          const lastViewedLectureId = progressData.progress[lastViewedIndex]?.lectureId;
          let foundLecture: Lecture | null = null;
          for (const section of progressData.courseDetails?.curriculum || []) {
            for (const lecture of section.lectures) {
              if (lecture._id === lastViewedLectureId) {
                foundLecture = lecture;
                break;
              }
            }
            if (foundLecture) break;
          }

          if (foundLecture) {
            setCurrentLecture(foundLecture);
          } else if (firstLecture) {
            setCurrentLecture(firstLecture);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch course progress:", err);
    }
  };

  const handleRewatchCourse = async () => {
    if (!id) return;
    const response = await resetCurrentCourseProgress(studentId, id);
    if (response?.data?.success) {
      setCurrentLecture(null);
      setShowConfetti(false);
      setShowCompleteCourseDialog(false);
      fetchStudentCourseProgress();
    }
  };

  const updateCourseProgress = async () => {
    if (!currentLecture || !id) return;
    const alreadyViewed = studentCurrentCourseProgress?.progress?.some(
      (item: LectureProgress) => item.lectureId === currentLecture._id && item.viewed
    );
    if (alreadyViewed) return;
    if (!user?.id || !studentCurrentCourseProgress?.courseDetails?._id || !currentLecture?._id) return;

    const res = await markCurrentLectureAsViewed(
      user.id,
      studentCurrentCourseProgress.courseDetails._id,
      currentLecture._id
    );

    if (res?.data?.success) fetchStudentCourseProgress();
  };
  console.log(studentCurrentCourseProgress);

  useEffect(() => {
    if (id) fetchStudentCourseProgress();
  }, [id]);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  useEffect(() => {
    if (currentLecture?.progressValue === 1) updateCourseProgress();
  }, [currentLecture]);

  return (
    <div className="flex flex-col h-screen bg-[#1c1d1f] text-white">
      {showConfetti && <Confetti />}

      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#1c1d1f] border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate("/student-courses")}
            className="text-black bg-white rounded"
            variant="ghost"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4 mr-2 text-black" />
            Back to My Courses Page
          </Button>
          <h1 className="text-lg font-bold hidden md:block text-white">
            {studentCurrentCourseProgress?.courseDetails?.title}
          </h1>
        </div>
        <Button onClick={() => setIsSideBarOpen(!isSideBarOpen)} className="text-white">
          {isSideBarOpen ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Player Section */}
        <div className={`flex-1 ${isSideBarOpen ? "mr-[400px]" : ""} transition-all duration-300`}>
          {currentLecture && (
            <div>
              {currentLecture.fileType?.startsWith("video") ? (
                <VideoPlayer
                  width="100%"
                  height="500px"
                  url={currentLecture?.fileUrl ?? ""}
                  onComplete={() => updateCourseProgress()}
                />
              ) : currentLecture.fileType?.includes("pdf") ? (
                <iframe
                  src={currentLecture?.fileUrl ?? ""}
                  className="w-full h-[500px]"
                  onLoad={() => updateCourseProgress()}
                />
              ) : (
                <img
                  src={currentLecture.fileUrl}
                  alt="Lecture"
                  className="max-w-full max-h-[500px] mx-auto"
                  onLoad={() => updateCourseProgress()}
                />
              )}

              <div className="p-6 bg-[#1c1d1f]">
                <h2 className="text-2xl font-bold mb-2">{currentLecture.lectureTitle}</h2>
              </div>
              <div className={`fixed top-[64px] right-0 bottom-0 w-[400px] bg-[$1c1df] border-1 border-gray-700 transition-all duration-300 ${isSideBarOpen ? 'translate-x-0' : 'translate-x-full'}`}>Course Side Bar</div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div
          className={`fixed top-[64px] right-0 bottom-0 w-[400px] bg-[#1c1d1f] border-l border-gray-700 transition-all duration-300 ${isSideBarOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <Tabs defaultValue="content" className="h-full flex flex-col">
            <TabsList className="grid bg-[#1c1d1f] w-full grid-cols-2 p-0 h-14">
              <TabsTrigger value="content" className="text-black rounded-none h-full">
                Course Content
              </TabsTrigger>
              <TabsTrigger value="overview" className="text-white rounded-none h-full">
                Overview
              </TabsTrigger>
            </TabsList>

            {/* Content Tab */}
            <TabsContent value="content">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {studentCurrentCourseProgress?.courseDetails?.curriculum && studentCurrentCourseProgress?.courseDetails?.curriculum.map((section) => (
                    <div key={section._id} className="space-y-2">
                      <h2 className="text-md font-semibold text-white border-b border-gray-600 pb-1">
                        {section.sectionTitle}
                      </h2>
                      {section.lectures.map((lecture) => (
                        <div
                          key={lecture._id}
                          onClick={() => setCurrentLecture(lecture)}
                          className="flex items-center space-x-2 text-sm text-white font-medium cursor-pointer hover:text-blue-300"
                        >
                          {studentCurrentCourseProgress?.progress?.find(
                            (progressItem) => progressItem.lectureId === lecture._id
                          )?.viewed ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                          <span>{lecture.lectureTitle}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Overview Tab */}
            <TabsContent value="overview" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-4">About this course</h2>
                  <p className="text-gray-400">
                    {studentCurrentCourseProgress?.courseDetails?.description}
                  </p>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>


      {/* Dialogs */}
      <Dialog open={lockCourse}>
        <DialogContent className="sm:w-[425px] bg-white text-black">
          <DialogHeader>
            <DialogTitle>You can't view this page</DialogTitle>

            <div className="flex flex-col gap-3 px-2">
              <Label>              Please purchase this course to get access.
              </Label>
            </div>


          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={showCourseCompleteDialog}>
        <DialogContent showOverlay={false} className="sm:w-[425px] bg-white text-black">
          <DialogHeader>
            <DialogTitle>Congratulations!</DialogTitle>
            <div className="flex flex-col gap-3 px-2">
              <Label>You have completed the course.</Label>
              <div className="flex flex-row gap-3">
                <Button onClick={() => navigate("/student-courses")} variant="ghost">
                  My Courses Page
                </Button>
                <Button onClick={handleRewatchCourse} variant="ghost">
                  Rewatch Course
                </Button>
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentViewCourseProgressPage;
