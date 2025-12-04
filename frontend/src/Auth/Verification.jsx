import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../Utils/axiosConfig.js";

const Verification = () => {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post("/api/auth/verifyemail", { code });

            if (res.data.success) {
                toast.success("Email verified successfully! Please login.");
                navigate("/login");
            } else {
                toast.error(res.data.message || "Verification failed");
            }
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Invalid or Expired Code");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700 px-4">
            <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
                <h1 className="text-3xl font-extrabold text-center text-white mb-2">
                    Verify Your <span className="text-blue-400">Email</span>
                </h1>
                <p className="text-center text-gray-300 mb-8">
                    Enter the verification code sent to your email.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="code" className="block text-gray-200 font-semibold mb-2">
                            Verification Code
                        </label>
                        <input
                            id="code"
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Enter 6-digit code"
                            className="w-full px-4 py-3 bg-white/20 text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-400 text-center tracking-widest text-xl"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Verifying..." : "Verify Email"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Verification;
