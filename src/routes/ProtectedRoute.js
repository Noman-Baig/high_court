// // src/routes/ProtectedRoute.js
// import React from "react";
// import { Outlet, Navigate } from "react-router-dom";
// import { useAuth } from "../auth/Auth";

// const ProtectedRoute = () => {
//   const { isAuthenticated, role, permissions } = useAuth();
//   const path = window.location.pathname
//     .slice(1)
//     .replace("-", " ")
//     .split(" ")
//     .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//     .join(" ");

//   if (!isAuthenticated) return <Navigate to="/login" />;

//   if (role !== "admin" && !permissions[role].includes(path))
//     return <Navigate to="/dashboard" />;

//   return <Outlet />;
// };

// export default ProtectedRoute;

import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/Auth";

const ProtectedRoute = () => {
  const { isAuthenticated, authLoading, role, permissions } = useAuth();
  const location = useLocation();

  if (authLoading) return null; // ⬅ wait for auth

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const currentPath = location.pathname.replace("/", "");

  const allowedPages = permissions[role] || [];

  if (!allowedPages.includes(currentPath)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
