import { Moon, Sun, GraduationCap } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(() => sessionStorage.getItem("theme") === "dark");
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      sessionStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      sessionStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const getInitial = (name: string) => name?.charAt(0).toUpperCase() || "U";

  return (
    <nav className="bg-gray-200 dark:bg-gray-800 p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
      {/* Logo Section */}
      {/* Show Home link only for students */}
      {user?.role === "student" ? (
        <Link to="/home" className="flex items-center text-gray-900 dark:text-white">
          <GraduationCap className="h-8 w-8 mr-2" />
          <span className="font-extrabold text-lg md:text-xl">LMS Learn</span>
        </Link>
      ) : (
        <div className="flex items-center text-gray-900 dark:text-white">
          <GraduationCap className="h-8 w-8 mr-2" />
          <span className="font-extrabold text-lg md:text-xl">LMS Learn</span>
        </div>
      )}

      {/* Right Section */}
      <div className="flex items-center gap-4 relative">
        {/* If student, show links */}
        {user?.role === "student" && (
          <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
            <Link
              to="/explore-courses"
              onClick={(e) => {
                if (location.pathname === "/explore-courses") {
                  e.preventDefault(); // prevents re-navigation
                }
              }}
              className={`hover:border-b-2 hover:border-white-500 pb-1 ${location.pathname === "/explore-courses" ? "border-b-2 border-white-500" : ""}`}
            >
              Explore Courses
            </Link>


            <Link
              to="/student-courses"
              className={`hover:border-b-2 hover:border-white-500 pb-1 ${location.pathname === "/my-courses" ? "border-b-2 border-white-500" : ""
                }`}
            >
              My Courses
            </Link>
          </div>
        )}

        {/* User Profile Dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(prev => !prev)}
              className="flex items-center gap-2 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                {getInitial(user.username)}
              </div>
            </button>
            {showDropdown && (
              <div className="absolute top-10 right-0 bg-white dark:bg-gray-700 border dark:border-gray-600 shadow-md rounded p-3 z-50 w-56 text-sm">
                <div className="font-medium text-gray-800 dark:text-white px-2 py-1">Name: {user.username}</div>
                <div className="font-medium text-gray-800 dark:text-white px-2 py-1">Email: {user.useremail}</div>
                <div className="text-gray-500 dark:text-gray-300 px-2 py-1">Role: {user.role}</div>
                <hr className="my-2 border-gray-300 dark:border-gray-600" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-red-600 hover:bg-red-100 dark:hover:bg-red-900 px-2 py-1 rounded"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="text-sm px-3 py-1 border rounded dark:border-white border-black flex items-center gap-1 text-gray-800 dark:text-white"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {darkMode ? "Light" : "Dark"}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
