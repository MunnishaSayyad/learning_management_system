// src/components/route-guard.tsx
import { useLocation, Navigate } from "react-router-dom";
import { Fragment } from "react";
import type { ReactNode } from "react";
import type { User } from "@/types/index";

interface RouteGuardProps {
  authenticated: boolean;
  user: User | null;
  element: ReactNode;
}

export default function RouteGuard({
  authenticated,
  user,
  element
}: RouteGuardProps) {
  const location = useLocation();

  const isAuthPage = location.pathname.startsWith("/auth");
  const isInstructorRoute = location.pathname.startsWith("/instructor");

  // 🚫 Not Authenticated – Redirect to login
  if (!authenticated && !isAuthPage) {
    return <Navigate to="/auth" replace />;
  }

  // ✅ Student trying to access instructor/admin routes
  if (
    authenticated &&
    user?.role !== "instructor" &&
    (isInstructorRoute || isAuthPage)
  ) {
    return <Navigate to="/home" replace />;
  }

  // ✅ Instructor trying to access student/admin routes
  if (
    authenticated &&
    user?.role === "instructor" &&
    !isInstructorRoute &&
    !isAuthPage
  ) {
    return <Navigate to="/instructor" replace />;
  }

  // ✅ Allow
  return <Fragment>{element}</Fragment>;
}
