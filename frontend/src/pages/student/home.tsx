
import { courseCategories } from '@/config';
import { Button } from '@/components/ui/button';
import { useStudent } from "../../context/StudentContext";
import { Link, useNavigate } from 'react-router-dom';
const StudentHomePage = () => {
  const { studentViewCourseList, checkPurchasedCourse } = useStudent();
  const navigate = useNavigate();
  const handleCourseNaviagate = async (courseId: string) => {
    const data = await checkPurchasedCourse(courseId);
    if (data?.success) {
      if (data?.data) {
        navigate(`/course-progress/${courseId}`)
      } else {
        navigate(`/course/details/${courseId}`)

      }
    }
  }
  const handleNavigateToCourseList = (categoryId: string) => {
    sessionStorage.removeItem("courseFilters");
    const currentFilter = {
      category: [categoryId]
    }
    sessionStorage.setItem("courseFilters", JSON.stringify(currentFilter));

    navigate('/explore-courses');
  }
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Hero Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center px-6 lg:px-20 py-12">
        {/* Left Text Content */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Your Learning Journey Starts Here 🚀
          </h1>
          <p className="text-lg md:text-xl mb-6">
            Learn in-demand skills, explore your interests, and build your future.
          </p>
          <Link to="/explore-courses"><Button className="mt-2">Start Exploring</Button></Link>
        </div>

        {/* Right Image */}
        <div className="flex justify-center">
          <img
            src="coverPage.png"
            alt="Learning Illustration"
            className="w-full max-w-lg rounded-xl shadow-xl"
          />
        </div>
      </section>

      {/* Course Categories Section */}
      <section className="px-6 lg:px-20 py-12 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">
          Course Categories
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {courseCategories.map((categoryItem) => (
            <div
              key={categoryItem.id}
              className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow hover:shadow-md transition-all cursor-pointer text-center"
              onClick={() => handleNavigateToCourseList(categoryItem?.id)}
            >
              <p className="text-md font-medium">{categoryItem.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="px-6 lg:px-20 py-12 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">
          Featured Courses
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {studentViewCourseList && studentViewCourseList.length > 0 ? studentViewCourseList.map((courseItem) => (
            <div
              key={courseItem._id}
              // className="border rounded-lg overflow-hidden shadow cursor-pointer"
              className="bg-white cursor-pointer dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow hover:shadow-lg transition-all p-5"
              onClick={() => handleCourseNaviagate(courseItem?._id || "")}

            >
              <img
                src={courseItem?.image}
                width={300}
                height={150}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold mb-2">{courseItem?.title}</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                {courseItem.subtitle}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                by {courseItem.instructorName}
              </p>
              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 text-[16px]">₹ {courseItem?.pricing}</p>
            </div>
          )) : (<h1>No courses found</h1>)}
        </div>

      </section>
    </main>
  );
};

export default StudentHomePage;
