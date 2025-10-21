import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDownIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { filterOptions, sortOptions, type SelectOption } from "@/config";
import { Label } from "@/components/ui/label";
import { useStudent } from "@/context/StudentContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useSearchParams } from "react-router-dom";

type FilterKey = keyof typeof filterOptions;


const StudentViewCoursesPage = () => {
  const { studentViewCourseList, loading, getCoursesByFilters, checkPurchasedCourse } = useStudent();

  const [sort, setSort] = useState("price-lowtohigh");
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  console.log("studentViewCourseList:", studentViewCourseList)

  const createSearchQuery = (filters: Record<string, string[]>): string => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, values]) => {
      if (values.length > 0) {
        params.set(key, values.join(","));
      }
    });
    return params.toString();
  };

  const handleFilterOnChange = (category: string, option: SelectOption) => {
    setFilters((prevFilters) => {
      const currentValues = prevFilters[category] || [];
      const isSelected = currentValues.includes(option.id);

      const updatedValues = isSelected
        ? currentValues.filter((val) => val !== option.id)
        : [...currentValues, option.id];

      const updatedFilters = {
        ...prevFilters,
        [category]: updatedValues,
      };

      // ✅ Store in 
      sessionStorage.setItem("courseFilters", JSON.stringify(updatedFilters));

      return updatedFilters;
    });
  };

  const handleCourseNaviagate = async (courseId: string) => {

    const data = await checkPurchasedCourse(courseId);
    console.log(data);
    if (data?.success) {
      if (data?.data) {
        navigate(`/course-progress/${courseId}`)
      } else {
        navigate(`/course/details/${courseId}`)

      }
    }
  }

  useEffect(() => {
    const buildQueryStringForFilters = createSearchQuery(filters);
    setSearchParams(new URLSearchParams(buildQueryStringForFilters));
  }, [filters]);

  useEffect(() => {
    setSort("price-lowtohigh");

    const savedFilters = sessionStorage.getItem("courseFilters");
    if (savedFilters) {
      setFilters(JSON.parse(savedFilters));
    }
  }, []);

  useEffect(() => {
    sessionStorage.removeItem("courseFilters");
  }, []);


  useEffect(() => {
    if (filters != null && sort !== null) {
      getCoursesByFilters(filters, sort);
    }
  }, [filters, sort]);


  return (
    <div className="min-h-screen px-6 py-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">

      <h1 className="text-3xl md:text-4xl font-bold mb-8">All Courses</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-72 space-y-6 border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-gray-50 dark:bg-gray-800 ">



          {(Object.keys(filterOptions) as FilterKey[]).map((keyItem) => (
            <div key={keyItem} className="space-y-3">
              <h3 className="font-semibold text-lg tracking-wide uppercase">
                {keyItem}
              </h3>
              <div className="space-y-2">
                {filterOptions[keyItem].map((option: SelectOption) => (
                  <Label
                    key={option.id}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <Checkbox
                      checked={filters[keyItem]?.includes(option.id) || false}
                      onCheckedChange={() =>
                        handleFilterOnChange(keyItem, option)
                      }
                    />
                    <span className="text-sm">{option.label}</span>
                  </Label>
                ))}
              </div>
            </div>
          ))}
        </aside>

        {/* Main Content */}
        <main className="flex-1">

          {/* Sort and Count */}
          <div className="flex justify-end items-center mb-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ArrowUpDownIcon className="h-4 w-4" />
                  <span className="font-medium">Sort By</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 dark:text-white">
                <DropdownMenuRadioGroup
                  value={sort}
                  onValueChange={(value) => setSort(value)}
                >
                  {sortOptions.map((sortItem) => (
                    <DropdownMenuRadioItem
                      value={sortItem.id}
                      key={sortItem.id}
                    >
                      {sortItem.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <span className="p-2 text-md font-bold text-gray-600 dark:text-gray-300">
              {studentViewCourseList.length} results
            </span>
          </div>

          <div className="space-y-4">
            {studentViewCourseList && studentViewCourseList.length > 0 ?
              studentViewCourseList.map(courseItem => (
                <Card
                  className="cursor-pointer"
                  key={courseItem?._id}
                  onClick={() => handleCourseNaviagate(courseItem?._id || "")}
                >
                  <CardContent className="flex gap-4 p-4">
                    <div className="w-48 h-32 flex-shrink-0">
                      <img
                        src={courseItem?.image}
                        className="w-ful h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {courseItem?.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mb-1">
                        Created By{" "}
                        <span className="font-bold">
                          {courseItem?.instructorName}
                        </span>
                      </p>
                      <p className="text-[16px] text-gray-600 mt-3 mb-2">
                        {(() => {
                          const totalLectures = courseItem?.curriculum?.reduce(
                            (total, section) => total + (section.lectures?.length || 0),
                            0
                          );

                          return `${totalLectures} ${totalLectures === 1 ? 'Lecture' : 'Lectures'} - ${courseItem?.level.toUpperCase()} Level`;
                        })()}
                      </p>

                      <p className="font-bold text-lg">
                        ${courseItem?.pricing}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
              ) : loading ? (
                // <h1>Loading content </h1>
                <Skeleton />
              ) : (
                <h1 className="font-extrabold text-4xl">No Courses Found</h1>
              )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentViewCoursesPage;
