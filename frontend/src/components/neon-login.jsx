import React, { useState } from "react";
import { Github, Mail } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const Button = ({ children, className, ...props }) => (
  <button
    className={`font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Input = ({ className, ...props }) => (
  <input
    className={`w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded py-2 px-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${className}`}
    {...props}
  />
);

const Label = ({ children, className, ...props }) => (
  <label className={`block text-gray-300 mb-2 ${className}`} {...props}>
    {children}
  </label>
);

const NeonLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/signup";
      const payload = isLogin
        ? { email, password }
        : { email, password, company };
      const response = await axios.post(`${API_URL}${endpoint}`, payload);

      // Handle successful login/signup
      localStorage.setItem("token", response.data.token);
      // Redirect or update app state here
      console.log("Authentication successful");
    } catch (error) {
      setError(error.response?.data?.error || "An error occurred");
    }
  };

  const handleGithubLogin = async () => {
    // Redirect to GitHub OAuth page
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${
      import.meta.env.VITE_GITHUB_CLIENT_ID
    }&redirect_uri=${encodeURIComponent(
      window.location.origin + "/github-callback"
    )}`;
  };

  const handleGoogleLogin = async () => {
    try {
      // Load Google Sign-In API
      await loadGoogleSignIn();

      const googleUser = await new Promise((resolve) => {
        window.gapi.auth2.getAuthInstance().signIn().then(resolve);
      });

      const id_token = googleUser.getAuthResponse().id_token;

      const response = await axios.post(`${API_URL}/auth/google`, {
        token: id_token,
      });

      // Handle successful login
      localStorage.setItem("token", response.data.token);
      // Redirect or update app state here
      console.log("Google authentication successful");
    } catch (error) {
      setError("Google authentication failed");
    }
  };

  // Function to load Google Sign-In API
  const loadGoogleSignIn = () => {
    return new Promise((resolve) => {
      window.gapi.load("auth2", () => {
        window.gapi.auth2
          .init({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          })
          .then(resolve);
      });
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 z-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 opacity-30 animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 20 + 10}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          ></div>
        ))}
      </div>
      {/* Login/Signup form */}
      <div className="bg-gray-900 p-8 rounded-lg shadow-2xl z-10 w-96 backdrop-blur-sm bg-opacity-70 border border-gray-800">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          {isLogin ? "Login" : "Sign Up"}
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {!isLogin && (
            <div>
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                type="text"
                placeholder="Enter your company name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
          )}
          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-500 text-white"
          >
            {isLogin ? "Login" : "Sign Up"}
          </Button>
        </form>
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        <div className="mt-4 text-center">
          <span className="text-gray-400">or</span>
        </div>
        <Button
          className="w-full mt-4 bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center"
          onClick={handleGithubLogin}
        >
          <Github className="mr-2" />
          Continue with GitHub
        </Button>
        <Button
          className="w-full mt-4 bg-red-600 hover:bg-red-500 text-white flex items-center justify-center"
          onClick={handleGoogleLogin}
        >
          <Mail className="mr-2" />
          Continue with Google
        </Button>
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-purple-400 hover:text-purple-300 transition duration-300 ease-in-out"
          >
            {isLogin
              ? "Don't have an account? Sign Up"
              : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NeonLogin;
