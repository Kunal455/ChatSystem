import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "https://chat-backend-u9ll.onrender.com",
    withCredentials: true,
});

export default axiosInstance;
