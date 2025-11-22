import { createContext, useContext, useState, useEffect } from "react";
import axios from "../utils/axiosConfig";

export const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
    const [authUser, setAuthUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Verify token and get user on app load
    useEffect(() => {
        const verifyUser = async () => {
            try {
                // Check if user data exists in localStorage
                const storedUser = localStorage.getItem("chatapp");

                if (storedUser) {
                    // Try to verify token with backend
                    const res = await axios.get("/api/user/me");
                    if (res.data.success) {
                        // Token is valid, set user
                        setAuthUser(res.data.user);
                        // Update localStorage with fresh user data
                        localStorage.setItem("chatapp", JSON.stringify(res.data.user));
                    } else {
                        // Token invalid, clear storage
                        localStorage.removeItem("chatapp");
                        setAuthUser(null);
                    }
                } else {
                    setAuthUser(null);
                }
            } catch (error) {
                // Token invalid or expired, clear storage
                localStorage.removeItem("chatapp");
                setAuthUser(null);
            } finally {
                setLoading(false);
            }
        };

        verifyUser();
    }, []);

    // Update localStorage whenever authUser changes
    useEffect(() => {
        if (authUser) {
            localStorage.setItem("chatapp", JSON.stringify(authUser));
        } else {
            localStorage.removeItem("chatapp");
        }
    }, [authUser]);

    return (
        <AuthContext.Provider value={{ authUser, setAuthUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};