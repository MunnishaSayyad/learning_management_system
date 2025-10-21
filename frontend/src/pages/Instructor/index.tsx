import { Outlet } from "react-router-dom";
import Sidebar from "@/components/instructor-view/Sidebar";

const InstructorDashboardPage = () => {

  return (
    <div className="flex m-2 ">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
        <Outlet />
      </main>
    </div>
  );
};

export default InstructorDashboardPage;
