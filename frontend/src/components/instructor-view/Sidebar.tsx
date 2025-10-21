import { Home, BookOpen, PlusCircle, UserCheck } from 'lucide-react';


import { useNavigate, useLocation } from 'react-router-dom';

const tabs = [
  { name: 'Dashboard', path: '/instructor/dashboard', icon: <Home size={18} /> },
  { name: 'Add Course', path: '/instructor/create-new-course', icon: <PlusCircle size={18} /> },
  { name: "Enrolled Students", path: "/instructor/enrolled-students", icon: <UserCheck size={18} /> },
  { name: 'Notifications', path: '/instructor/notifications', icon: <BookOpen size={18} /> },

];


const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleOnClick = async (path: string) => {
    navigate(path);

  };

  return (
    <aside className="w-60 p-4 border-r min-h-screen bg-white dark:bg-gray-900 sticky top-0 h-screen overflow-y-auto">
      <h2 className="text-lg font-semibold mb-6">Instructor Panel</h2>
      <ul className="space-y-2">
        {tabs.map(({ name, path, icon }) => (
          <li
            key={name}
            onClick={() => handleOnClick(path)}
            className={`flex items-center space-x-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 hover:cursor-pointer ${location.pathname === path ? "bg-gray-200 dark:bg-gray-700 font-semibold" : ""
              }`}
          >
            {icon}
            <span>{name}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
