import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export const VerifyUser = () => {
    const { authUser, loading } = useAuth();

    // Show loading state while verifying authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return authUser ? <Outlet /> : <Navigate to={"/login"} />;
};