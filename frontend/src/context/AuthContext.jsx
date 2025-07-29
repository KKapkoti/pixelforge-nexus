import React, { createContext, useState, useContext, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(() => {
    const stored = localStorage.getItem("auth");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (data) => {
    setAuthData(data);
    localStorage.setItem("auth", JSON.stringify(data));
  };

  const logout = () => {
    setAuthData(null);
    localStorage.removeItem("auth");
  };

  return (
    <AuthContext.Provider value={{ authData, setAuthData: login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Add this custom hook:
export const useAuth = () => useContext(AuthContext);
