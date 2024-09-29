import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { Toaster, toast } from "react-hot-toast"; // Import toast provider
import { PdfaiNeonAuth } from "./components/pdfai-neon-auth";
import Home from "./pages/Home"; // Assuming Home.jsx exists

const App = () => {
  // Initialize authentication state from localStorage
  const [isAuthenticated, setIsAuthenticated] = React.useState(
    () => localStorage.getItem("isAuthenticated") === "true" || false
  );

  // Handle login success
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true"); // Persist auth state in localStorage
    toast.success("Login successful! Welcome to PDFAI.", {
      style: {
        background: "#000000",
        color: "#00ffff",
      },
    });
  };

  // Handle logout (optional)
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userToken"); // You can also remove the token here
  };

  // Check authentication status on page load
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={<PdfaiNeonAuth onLoginSuccess={handleLoginSuccess} />}
          />
          <Route
            path="/home"
            element={
              isAuthenticated ? (
                <Home onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>

      {/* Toast provider with custom black theme for all toasts */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#000000",
            color: "#00ffff",
          },
        }}
      />
    </>
  );
};

export default App;
