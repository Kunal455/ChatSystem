import axios from "../Utils/axiosConfig";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../Context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { authUser, setAuthUser, loading: authLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && authUser) {
      navigate("/");
    }
  }, [authUser, authLoading, navigate]);
  const [loading, setLoading] = useState(false);
  const [profilepic, setProfilepic] = useState(null);
  const [preview, setPreview] = useState(null);

  const [inputData, setInputData] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    confpassword: "",
    gender: "",
  });

  const handleInput = (e) => {
    setInputData({
      ...inputData,
      [e.target.id]: e.target.value,
    });
  };

  const selectGender = (gender) => {
    setInputData((prev) => ({
      ...prev,
      gender: prev.gender === gender ? "" : gender,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilepic(file);
      setPreview(URL.createObjectURL(file)); // For instant preview
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (inputData.password !== inputData.confpassword) {
      setLoading(false);
      return toast.error("Passwords do not match!");
    }

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append("fullname", inputData.fullname);
      formData.append("username", inputData.username);
      formData.append("email", inputData.email);
      formData.append("password", inputData.password);
      formData.append("gender", inputData.gender);
      if (profilepic) formData.append("profilepic", profilepic);

      const res = await axios.post(`/api/auth/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = res.data;

      if (data.success === false) {
        setLoading(false);
        return toast.error(data.message);
      }

      // ✅ FIX: Correctly get the nested 'data.user' object
      const user = data.user;
      localStorage.setItem("chatapp", JSON.stringify(user));
      setAuthUser(user);

      // ✅ FIX: Use the message from the backend
      toast.success(data.message || "Registered successfully!");
      setLoading(false);

      // Navigate to home after registration
      navigate("/login");

    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700 px-4">
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
        <h1 className="text-4xl font-extrabold text-center text-white">
          Create your <span className="text-green-400">Chatters</span> account
        </h1>
        <p className="text-center text-gray-300 mt-2">
          Join and start connecting today
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5" encType="multipart/form-data">
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center mb-4">
            <label
              htmlFor="profilepic"
              className="cursor-pointer relative w-24 h-24 rounded-full border-2 border-green-400 flex items-center justify-center overflow-hidden bg-white/10"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-gray-300 text-sm">Upload Photo</span>
              )}
              <input
                id="profilepic"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
            <p className="text-gray-400 text-xs mt-2">Max size: 5MB (JPG/PNG)</p>
          </div>

          {/* Other Inputs */}
          {["fullname", "username", "email", "password", "confpassword"].map((field) => (
            <div key={field}>
              <label htmlFor={field} className="block text-gray-200 font-semibold mb-1">
                {field.charAt(0).toUpperCase() + field.slice(1).replace("confpassword", "Confirm Password")}
              </label>
              <input
                id={field}
                type={field.includes("password") ? "password" : "text"}
                onChange={handleInput}
                placeholder={`Enter ${field.replace("confpassword", "confirm password")}`}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          ))}

          {/* Gender selection */}
          <div className="flex items-center justify-center gap-6 mt-4">
            {["male", "female"].map((g) => (
              <label key={g} className="flex items-center gap-2 text-gray-200 font-semibold cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  checked={inputData.gender === g}
                  onChange={() => selectGender(g)}
                  className="w-4 h-4 text-green-400 focus:ring-green-500"
                />
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-transform transform hover:scale-105"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-center text-gray-300 text-sm mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-green-400 font-semibold hover:underline">
            Login Now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;


