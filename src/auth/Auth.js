import React, { createContext, useContext, useState, useEffect } from "react";
import { secureGet, secureSet, secureRemove } from "../utils/secureStorage";

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const permissions = {
    admin: [
      "dashboard",
      "library",
      "members",
      "register",
      "complaints",
      "finance",
      "committees",
      "welfare",
      "settings",
      "profile",
      "elections",
      "bookings",
    ],
    member: ["dashboard", "complaints", "welfare", "library", "profile"],
    president: ["dashboard", "complaints"],
    "vice-president": ["dashboard", "members", "finance"],
    "general-secretary": ["dashboard", "complaints", "members", "bookings"],
    "joint-secretary": ["dashboard"],
    "library-secretary": ["dashboard", "finance"],
    treasurer: ["dashboard", "finance"],
    // committee_chairman: ["dashboard"],
  };

  useEffect(() => {
    const token = secureGet("token");
    const storedUser = secureGet("myDetails");
    const storedRole = secureGet("role");

    if (token && storedUser && storedRole) {
      setIsAuthenticated(true);
      setUser(storedUser);
      setRole(storedRole);
      setToken(token);
    }

    setAuthLoading(false);
  }, []);

  const login = ({ token, user }) => {
    secureSet("token", token, 1000 * 60 * 60 * 6);
    secureSet("myDetails", user);
    secureSet("role", user.role);

    setIsAuthenticated(true);
    setUser(user);
    setRole(user.role);
    setToken(token);
  };

  const logout = () => {
    secureRemove("token");
    secureRemove("myDetails");
    secureRemove("role");

    setIsAuthenticated(false);
    setUser(null);
    setRole(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        authLoading,
        role,
        user,
        token,
        permissions,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;
