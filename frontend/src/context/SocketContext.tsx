// src/context/SocketContext.tsx
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";

const SOCKET_URL = import.meta.env.VITE_API_URL;

interface SocketContextType {
  socket: Socket | null;
  notifications: NotificationData[];
}
export interface NotificationData {
  courseId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  message: string;
  createdAt?: string;
}

const SocketContext = createContext<SocketContextType>({ socket: null, notifications: [] });

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {

  const socketRef = useRef<Socket | null>(null);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const { user } = useAuth();
  console.log(socketRef);
  console.log("Enter to socket COntext");

  useEffect(() => {
    if (user?.id) {
      const socket = io(SOCKET_URL, {
        query: { userId: user.id },
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("🟢 Connected to Socket.IO server");
        socket.emit("join", user.id);
      });

      socket.on("notification:new-enrollment", (payload) => {
        console.log("📢 Global notification received:", payload);
        toast.info(payload.message);
        setNotifications((prev) => [payload, ...prev]);
      });

      socket.on("disconnect", () => {
        console.log("🔌 Disconnected from Socket.IO server");
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user?.id]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, notifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
