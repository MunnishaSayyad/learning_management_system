import { useEffect, useMemo } from 'react';
import { useInstructor } from "@/context/InstructorContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, Users } from "lucide-react";
import { getCourses } from '@/api';
import type { CourseData } from '@/types';

type StudentListItem = {
  courseTitle: string;
  studentName: string;
  studentEmail: string;
};

const EnrolledStudents = () => {
  const { instructorCourseList, setInstructorCourseList } = useInstructor();

  const fetchAllCourses = async () => {
    const response = await getCourses();
    if (response.data.success) {
      const courses: CourseData[] = response.data.data;
      setInstructorCourseList(courses);
    }
  };

  useEffect(() => {
    fetchAllCourses();
  }, []);


  const { totalStudents, totalProfit, studentList } = useMemo(() => {
    return instructorCourseList.reduce(
      (acc, course) => {
        const studentCount = course?.students?.length ?? 0;
        acc.totalStudents += studentCount;
        acc.totalProfit += parseFloat(course.pricing) * studentCount;

        course?.students?.forEach((student) => {
          acc.studentList.push({
            courseTitle: course.title,
            studentName: student.studentName,
            studentEmail: student.studentEmail,
          });
        });

        return acc;
      },
      {
        totalStudents: 0,
        totalProfit: 0,
        studentList: [] as StudentListItem[],
      }
    );
  }, [instructorCourseList]); // <-- recalculate only when course list changes

  const config = [
    {
      icon: Users,
      label: "Total Students",
      value: totalStudents,
    },
    {
      icon: DollarSign,
      label: "Total Revenue",
      value: totalProfit,
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {config.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Students List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Student Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentList.length > 0 ? (
                  studentList.map((student, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{student.courseTitle}</TableCell>
                      <TableCell>{student.studentName}</TableCell>
                      <TableCell>{student.studentEmail}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500">
                      No students enrolled
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>

            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnrolledStudents;
