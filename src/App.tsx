import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userEmail = localStorage.getItem("userEmail");
    setIsAuthenticated(!!token && !!userEmail);
    setLoading(false);
  }, []);

  const handleLoginSuccess = (email: string) => {
    localStorage.setItem("userEmail", email);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {isAuthenticated ? (
          <>
            <Route path="/" element={<Dashboard onLogout={handleLogout} />} />
            <Route
              path="/dashboard"
              element={<Dashboard onLogout={handleLogout} />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route
              path="/"
              element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
            />
            <Route
              path="/login"
              element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
}
