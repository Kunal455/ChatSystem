import axios from "axios";

// Create axios instance with default config
const axiosInstance = axios.create({
    withCredentials: true, // Important for cookies to work with CORS
});

export default axiosInstance;

