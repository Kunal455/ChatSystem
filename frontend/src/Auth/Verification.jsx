import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../Utils/axiosConfig.js";

const Verification = () => {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);

    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    const navigate = useNavigate();
    const email = localStorage.getItem("verifyEmail");

    // Mask email for display
    const maskedEmail = email
        ? email.replace(/(.{3}).+(@.+)/, "$1***$2")
        : "your email";

    // Countdown timer logic
    useEffect(() => {
        if (timer === 0) {
            setCanResend(true);
            return;
        }
        const interval = setInterval(() => setTimer((t) => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    // EMAIL VERIFICATION SUBMIT
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (code.length !== 6) {
            toast.error("Please enter 6-digit code");
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post("/api/auth/verifyemail", { code });

            if (res.data.success) {
                toast.success("Email verified successfully!");
                navigate("/login");
            } else {
                toast.error(res.data.message || "Verification failed");
            }
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Invalid or expired code");
        } finally {
            setLoading(false);
        }
    };

    // RESEND OTP
    const handleResend = async () => {
        setCanResend(false);
        setTimer(60);

        try {
            await axios.post("/api/auth/resend-code", { email });
            toast.success("Verification code resent!");
        } catch (error) {
            const errMsg = error?.response?.data?.message || "Could not resend code";
            toast.error(errMsg);
            console.error("Resend Error:", error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700 px-4">
            <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
                <h1 className="text-3xl font-extrabold text-center text-white mb-2">
                    Verify Your <span className="text-blue-400">Email</span>
                </h1>

                <p className="text-center text-gray-300 mb-6">
                    We sent a 6-digit code to:
                    <br />
                    <span className="text-blue-300 font-semibold">{maskedEmail}</span>
                </p>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-6">

                    <div>
                        <label className="block text-gray-200 font-semibold mb-2">
                            Enter Verification Code
                        </label>

                        <input
                            type="text"
                            value={code}
                            maxLength={6}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, ""); // only digits
                                setCode(val);
                            }}
                            placeholder="●●●●●●"
                            className="w-full px-4 py-3 bg-white/20 text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-400 text-center tracking-widest text-2xl"
                            required
                        />
                        <p className="text-xs text-gray-300 mt-1 text-center">
                            Code must be 6 digits
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || code.length !== 6}
                        className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition disabled:opacity-50"
                    >
                        {loading ? "Verifying..." : "Verify Email"}
                    </button>
                </form>

                {/* RESEND SECTION */}
                <div className="mt-6 text-center">
                    {canResend ? (
                        <button
                            onClick={handleResend}
                            className="text-blue-300 hover:text-blue-400 font-semibold"
                        >
                            Resend Code
                        </button>
                    ) : (
                        <p className="text-gray-300">
                            Resend available in{" "}
                            <span className="text-blue-400 font-semibold">{timer}s</span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Verification;
