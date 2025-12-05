import axios from "../Utils/axiosConfig.js";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../Context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { authUser, loading: authLoading } = useAuth();

  // if already logged in, go home
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
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!inputData.email.endsWith("@gmail.com")) {
      setLoading(false);
      return toast.error("Please use a @gmail.com email address");
    }

    if (inputData.password !== inputData.confpassword) {
      setLoading(false);
      return toast.error("Passwords do not match!");
    }

    try {
      const formData = new FormData();
      formData.append("fullname", inputData.fullname);
      formData.append("username", inputData.username);
      formData.append("email", inputData.email);
      formData.append("password", inputData.password);
      formData.append("gender", inputData.gender);
      if (profilepic) formData.append("profilepic", profilepic);

      const res = await axios.post(`/api/auth/register`, formData);

      toast.success(res.data.message);

      setLoading(false);

      // ⛔ NO AUTO LOGIN
      // ⛔ NO setAuthUser
      // ⛔ NO localStorage

      navigate("/verify");

    } catch (error) {
      setLoading(false);
      console.error("Registration Error:", error);
      if (error.response) {
        console.error("Error Data:", error.response.data);
        console.error("Error Status:", error.response.status);
      }
      toast.error(error?.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700 px-4">
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
        <h1 className="text-4xl font-extrabold text-center text-white">
          Create your <span className="text-blue-400">Talkio</span> account
        </h1>
        <p className="text-center text-gray-300 mt-2">
          Join and start connecting today
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5" encType="multipart/form-data">

          <div className="flex flex-col items-center mb-4">
            <label
              htmlFor="profilepic"
              className="cursor-pointer relative w-24 h-24 rounded-full border-2 border-blue-400 flex items-center justify-center overflow-hidden bg-white/10"
            >
              {preview ? (
                <img src={preview} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-300 text-sm">Upload Photo</span>
              )}
              <input id="profilepic" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
            <p className="text-gray-400 text-xs mt-2">Max size: 5MB (JPG/PNG)</p>
          </div>

          {["fullname", "username", "email", "password", "confpassword"].map((field) => (
            <div key={field}>
              <label className="block text-gray-200 font-semibold mb-1">
                {field === "confpassword" ? "Confirm Password" : field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                id={field}
                type={field.includes("password") ? "password" : "text"}
                onChange={handleInput}
                required
                className="w-full px-4 py-3 bg-white/20 text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          ))}

          <div className="flex justify-center gap-6 mt-4">
            {["male", "female"].map((g) => (
              <label key={g} className="flex items-center gap-2 text-gray-200 font-semibold cursor-pointer">
                <input type="radio" name="gender" checked={inputData.gender === g} onChange={() => selectGender(g)} />
                {g}
              </label>
            ))}
          </div>

          <button disabled={loading} className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold">
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-center text-gray-300 text-sm mt-4">
          Already have an account?
          <Link to="/login" className="text-blue-400 font-semibold"> Login Now </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;


