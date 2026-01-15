// import React, { useState, useEffect } from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import Sidebar from "./components/Sidebar";
// import Header from "./components/Header";
// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
// import Library from "./pages/Library";
// import Complaints from "./pages/Complaints";
// import Finance from "./pages/Finance";
// import AdminSettings from "./pages/AdminSettings";
// import ProtectedRoute from "./routes/ProtectedRoute";
// import { useAuth } from "./auth/Auth";

// const App = () => {
//   const { isAuthenticated } = useAuth();
//   const [collapsed, setCollapsed] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);

//   useEffect(() => {
//     const resize = () => {
//       const mobile = window.innerWidth < 900;
//       setIsMobile(mobile);
//       if (mobile) setCollapsed(true);
//     };
//     resize();
//     window.addEventListener("resize", resize);
//     return () => window.removeEventListener("resize", resize);
//   }, []);

//   const sidebarWidth = collapsed ? 76 : 264;

//   return (
//     <div>
//       {isAuthenticated && (
//         <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
//       )}

//       <div
//         style={{
//           marginLeft: isAuthenticated && !isMobile ? sidebarWidth : 0,
//           transition: "margin-left 300ms cubic-bezier(.4,0,.2,1)",
//           minHeight: "100vh",
//           background: "linear-gradient(135deg,#f8fafc,#eef2f3)",
//           display: "flex",
//           flexDirection: "column",
//         }}
//       >
//         {isAuthenticated && <Header />}

//         <main
//           style={{
//             flex: 1,
//             padding: "28px",
//             animation: "fadeIn .3s ease",
//           }}
//         >
//           <Routes>
//             <Route
//               path="/login"
//               element={
//                 isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
//               }
//             />
//             <Route element={<ProtectedRoute />}>
//               <Route path="/dashboard" element={<Dashboard />} />
//               <Route path="/library" element={<Library />} />
//               <Route path="/complaints" element={<Complaints />} />
//               <Route path="/finance" element={<Finance />} />
//               <Route path="/admin-settings" element={<AdminSettings />} />
//             </Route>
//             <Route
//               path="*"
//               element={
//                 <Navigate to={isAuthenticated ? "/dashboard" : "/login"} />
//               }
//             />
//           </Routes>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default App;

// 192.168.

import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
// import Header from "./components/Header";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LibraryPage from "./pages/LibraryPage";
import GlassBoxPage from "./pages/GlassBoxPage";
// import Finance from "./pages/Finance";
import CommitteesPage from "./pages/CommitteesPage";
import UsersPage from "./pages/UsersPage";
// import AdminSettings from "./pages/AdminSettings";
import ProtectedRoute from "./routes/ProtectedRoute";
import { useAuth } from "./auth/Auth";
import WelfarePage from "./pages/WelfarePage";
import FinancePage from "./pages/FinancePage";
import MembersPage from "./pages/MembersPage";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Elections from "./pages/Elections";
import BookingsPage from "./pages/BookingsPage";

const App = () => {
  const { isAuthenticated } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const resize = () => {
      const mobile = window.innerWidth < 900;
      setIsMobile(mobile);
      if (mobile) setCollapsed(true);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const sidebarWidth = collapsed ? 76 : 264;

  return (
    <div style={{ minHeight: "100vh" }}>
      {isAuthenticated && (
        <>
          <Sidebar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            isMobile={isMobile}
          />

          {/* Mobile Overlay */}
          {isMobile && !collapsed && (
            <div
              onClick={() => setCollapsed(true)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                backdropFilter: "blur(2px)",
                zIndex: 999,
                transition: "opacity 200ms ease",
              }}
            />
          )}
        </>
      )}

      <div
        style={{
          marginLeft: isAuthenticated && !isMobile ? sidebarWidth : 0,
          transition: "margin-left 300ms cubic-bezier(.4,0,.2,1)",
          minHeight: "100vh",
          background: "linear-gradient(135deg,#f8fafc,#eef2f3)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* {isAuthenticated && <Header />} */}

        <main style={{ flex: 1, padding: "28px" }}>
          <Routes>
            <Route
              path="/login"
              element={
                isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
              }
            />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/complaints" element={<GlassBoxPage />} />
              <Route path="/finance" element={<FinancePage />} />
              <Route path="/committees" element={<CommitteesPage />} />
              <Route path="/register" element={<UsersPage />} />
              <Route path="/welfare" element={<WelfarePage />} />
              <Route path="/members" element={<MembersPage />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/elections" element={<Elections />} />
              <Route path="/bookings" element={<BookingsPage />} />
            </Route>
            <Route
              path="*"
              element={
                <Navigate to={isAuthenticated ? "/dashboard" : "/login"} />
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
