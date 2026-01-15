import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
 
const DashboardLayout = () => { 
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : false;
  });

  // Auto-collapse sidebar on mobile screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };
 
    handleResize();
 
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
 
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);
 
  const handleToggle = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} onToggle={handleToggle} />

      {/* Mobile overlay when sidebar is expanded */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={handleToggle}
          aria-hidden="true"
        />
      )}

      {/* Main Content Area */}
      <main
        className={`
          flex-1 overflow-y-auto bg-white
          transition-all duration-300 ease-in-out
          ${isCollapsed ? "lg:ml-0" : "lg:ml-0"}
        `}
      >
        <div className="min-h-full"> 
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
