import axios from "../Utils/axiosConfig.js";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../Context/AuthContext";


const Login = () => {
  const [userInput, setUserInput] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { authUser, setAuthUser, loading: authLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && authUser) {
      navigate("/");
    }
  }, [authUser, authLoading, navigate]);

  const handleInput = (e) => {
    setUserInput({
      ...userInput,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!userInput.email.endsWith("@gmail.com")) {
      setLoading(false);
      return toast.error("Please use a @gmail.com email address");
    }
    try {
      const res = await axios.post("/api/auth/login", userInput);
      const data = res.data;

      if (data.success === false) {
        setLoading(false);
        toast.error(data.message);
        return;
      }

      toast.success(data.message);

      // ✅ FIX: Store and set 'data.user' instead of the whole 'data' object
      localStorage.setItem("chatapp", JSON.stringify(data.user));
      setAuthUser(data.user)

      setLoading(false);
      navigate("/");
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Something went wrong!"
      );
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700 px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
        <h1 className="text-4xl font-extrabold text-center text-white">
          Welcome to <span className="text-blue-400">Chatters</span>
        </h1>
        <p className="text-center text-gray-300 mt-2">
          Sign in to continue
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-gray-200 font-semibold mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              onChange={handleInput}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-gray-200 font-semibold mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              onChange={handleInput}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-blue-400 hover:underline">
              Forgot Password?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-transform transform hover:scale-105"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-gray-300 text-sm mt-4">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-blue-400 font-semibold hover:underline"
          >
            Register Now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

