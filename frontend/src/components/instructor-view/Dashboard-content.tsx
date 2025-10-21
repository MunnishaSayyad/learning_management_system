import React from "react";
import { deleteCourseById } from "@/api";
import type { CourseData } from "@/types";


import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { mediaDeleteService, fetchCourseDetails } from "@/api";
import { useState } from "react";

interface DashboardContentProps {
  listOfCourses: CourseData[];
}
const DashboardContent: React.FC<DashboardContentProps> = ({ listOfCourses }) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClick = (courseId: string) => {
    setCourseToDelete(courseId);
    setShowDeleteDialog(true);
  };

  const handleCancelDelete = () => {
    setCourseToDelete(null);
    setShowDeleteDialog(false);
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;

    setIsDeleting(true);
    try {
      // 1. Get course details to find all media files
      const courseResponse = await fetchCourseDetails(courseToDelete);
      const course = courseResponse.data.data;

      // 2. Delete all media files from Cloudinary
      if (course.curriculum?.sections) {
        const deletePromises = [];

        for (const section of course.curriculum.sections) {
          if (section.lectures) {
            for (const lecture of section.lectures) {
              if (lecture.public_id) {
                deletePromises.push(
                  mediaDeleteService(lecture.public_id).catch(error => {
                    console.error(`Error deleting media ${lecture.public_id}:`, error);
                    return null;
                  })
                );
              }
            }
          }
        }

        await Promise.all(deletePromises);
      }

      // 3. Delete the course itself
      await deleteCourseById(courseToDelete);


      toast.success("Course and all associated media deleted successfully!");



    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Failed to delete course. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setCourseToDelete(null);
    }
  };

  return (
    <>
      <Card className="shadow-md p-4">
        <CardHeader>
          <CardTitle className="text-2xl">All Courses</CardTitle>
        </CardHeader>
        <CardContent>
          {listOfCourses.length === 0 ? (
            <p className="text-gray-500 text-center py-8 text-lg font-medium">
              No courses yet.
            </p>
          ) : (
            <Table>
              <TableCaption>List of all your created courses</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Course Name</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Revenue (₹)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listOfCourses.map((course) => (
                  <TableRow key={course._id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>{course.students?.length ?? 0}</TableCell>
                    <TableCell>
                      ₹{+course.pricing * (course.students?.length ?? 0)}
                    </TableCell>
                    <TableCell className="text-right space-x-4">
                      <button
                        title="Edit"
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => {
                          navigate(`/instructor/edit-course/${course._id}`);
                        }}
                      >
                        <Pencil className="w-4 h-4 inline-block" />
                      </button>
                      <button
                        title="Delete"
                        className="text-red-600 hover:text-red-800"
                        onClick={() => course._id && handleDeleteClick(course._id)}
                        disabled={isDeleting}

                      >
                        <Trash2 className="w-4 h-4 inline-block" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog} >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the course
              and all its associated media files from Cloudinary.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete} disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Course"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DashboardContent;
