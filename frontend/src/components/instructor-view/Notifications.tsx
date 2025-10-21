import { useSocket } from "@/context/SocketContext";
import { getNotifications } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import type { NotificationData } from "@/context/SocketContext";

const InstructorNotifications = () => {
  const { notifications: liveNotifications } = useSocket();
  const [userNotifications, setUserNotifications] = useState<NotificationData[]>([]);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    console.log("fetch Notifications");
    const response = await getNotifications(user?.id || "");
    console.log(response);
    if (response?.data?.success) {
      setUserNotifications(response?.data?.data);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  return (
    <div className="flex flex-col gap-2">
      {/* 🔴 Live Notifications */}
      <div className="bg-red-50 border border-red-300 rounded p-4 shadow-md">
        <h2 className="font-bold text-lg mb-2 text-red-800">📡 New Notifications</h2>
        {liveNotifications.length === 0 ? (
          <p className="text-red-700">No new notifications</p>
        ) : (
          <ul className="space-y-2">
            {liveNotifications.map((notif, index) => (
              <li key={index} className="text-sm text-red-700">
                {notif.message}
                <span>  {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : "No time"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 🗂️ Stored Notifications */}
      <div className="bg-blue-50 border border-blue-300 rounded p-4 shadow-md">
        <h2 className="font-bold text-lg mb-2 text-blue-800">🗃️ Past Notifications</h2>
        {userNotifications.length === 0 ? (
          <p className="text-blue-700">No saved notifications</p>
        ) : (
          <ul className="space-y-2">
            {userNotifications.map((notif, index) => (
              <li key={index} className="text-sm text-blue-700">
                <div>{notif.message}</div>
                <div className="text-xs text-gray-500">
                  {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : "No time"}
                </div>
                {/* {notif.message}
                <span className="text-gray-100">  {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : "No time"}
                </span> */}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default InstructorNotifications;
