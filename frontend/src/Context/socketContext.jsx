import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { useAuth } from "../Context/AuthContext";

const SocketContext = createContext();
export const useSocketContext = () => useContext(SocketContext);

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUser, setOnlineUser] = useState([]);
  const { authUser } = useAuth();

  useEffect(() => {
    if (authUser) {
      
      const newSocket = io(import.meta.env.VITE_API_URL, {
        withCredentials: true,
        query: { userId: authUser._id },
        transports: ["websocket", "polling"],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on("getOnlineUsers", (users) => {
        setOnlineUser(users);
      });

      newSocket.on("connect", () => console.log("🔥 Socket connected"));
      newSocket.on("disconnect", () => console.log("⚠️ Socket disconnected"));

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        setSocket(null);
      };

    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }

  }, [authUser]);

  return (
    <SocketContext.Provider value={{ socket, onlineUser }}>
      {children}
    </SocketContext.Provider>
  );
};
