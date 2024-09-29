import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Eye, EyeOff } from "lucide-react"; // Import eye icons
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const API_URL = "http://localhost:5000/api";

export function PdfaiNeonAuth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate(); // Create a navigate function

  // Debounce check if user exists
  useEffect(() => {
    if (!email) return;
    const delayDebounceFn = setTimeout(async () => {
      try {
        const { data } = await axios.post(`${API_URL}/auth/check-user`, {
          email,
        });
        setUserExists(data.exists);
      } catch (error) {
        console.error("Error checking user:", error);
      }
    }, 500); // 500ms debounce time

    return () => clearTimeout(delayDebounceFn); // Cleanup debounce
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (isLogin && !userExists) {
      setError("No account found with this email, please sign up.");
      setLoading(false);
      return;
    }

    try {
      let response;
      if (isLogin) {
        response = await axios.post(`${API_URL}/auth/login`, {
          email,
          password,
        });
      } else {
        response = await axios.post(`${API_URL}/auth/register`, {
          name,
          email,
          password,
        });
      }

      const { token, user } = response.data;
      localStorage.setItem("userToken", token); // Store token
      localStorage.setItem("user", JSON.stringify(user));

      console.log("Login/Signup successful. Navigating to Home...");

      // Call the login success handler to set auth state
      onLoginSuccess();

      // Redirect to Home after successful login or signup
      navigate("/home");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "An error occurred during authentication"
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black overflow-hidden">
      <NeonBackground />
      <div className="relative z-10 bg-black bg-opacity-70 p-8 rounded-lg shadow-2xl w-96 border border-cyan-500">
        <motion.div
          key={isLogin ? "login" : "signup"}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center mb-6">
            <FileText className="w-12 h-12 text-cyan-400 mr-2" />
            <h2 className="text-3xl font-bold text-cyan-400">
              PDFAI {isLogin ? "Login" : "Signup"}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="name" className="text-cyan-400">
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="mt-1 bg-black text-cyan-400 border-cyan-600 focus:border-cyan-400 placeholder-cyan-700"
                />
              </div>
            )}
            <div>
              <Label htmlFor="email" className="text-cyan-400">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="mt-1 bg-black text-cyan-400 border-cyan-600 focus:border-cyan-400 placeholder-cyan-700"
              />
              {isLogin && !userExists && email && (
                <p className="text-red-500 text-sm mt-1">
                  No account found with this email, please sign up.
                </p>
              )}
            </div>
            <div className="relative">
              <Label htmlFor="password" className="text-cyan-400">
                Password
              </Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="mt-1 bg-black text-cyan-400 border-cyan-600 focus:border-cyan-400 placeholder-cyan-700"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-10 text-cyan-400"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {!isLogin && (
              <div className="relative">
                <Label htmlFor="confirmPassword" className="text-cyan-400">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  className="mt-1 bg-black text-cyan-400 border-cyan-600 focus:border-cyan-400 placeholder-cyan-700"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-10 text-cyan-400"
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-black"
              disabled={loading}
            >
              {loading ? (
                <motion.div
                  className="h-5 w-5 rounded-full border-t-2 border-r-2 border-black"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : isLogin ? (
                "Login"
              ) : (
                "Sign up"
              )}{" "}
              with PDFAI
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-cyan-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={toggleMode}
              className="ml-1 text-cyan-300 hover:underline focus:outline-none"
            >
              {isLogin ? "Sign up" : "Login"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function NeonBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg className="w-full h-full">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%">
            <stop offset="0%" stopColor="#00ffff" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#00ffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad1)" />
        {[...Array(20)].map((_, i) => (
          <NeonLine key={i} />
        ))}
      </svg>
    </div>
  );
}

function NeonLine() {
  const startX = Math.random() * 100;
  const startY = Math.random() * 100;
  const endX = Math.random() * 100;
  const endY = Math.random() * 100;

  return (
    <motion.line
      x1={`${startX}%`}
      y1={`${startY}%`}
      x2={`${endX}%`}
      y2={`${endY}%`}
      stroke="#00ffff"
      strokeWidth="0.5"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{
        pathLength: [0, 1, 1, 0],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: 5 + Math.random() * 5,
        repeat: Infinity,
        repeatType: "loop",
        ease: "linear",
      }}
    />
  );
}
