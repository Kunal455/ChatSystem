import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { useAuth } from "/src/Context/AuthContext";


const SocketContext = createContext();

export const useSocketContext = () => useContext(SocketContext);

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUser, setOnlineUser] = useState([]);
  const { authUser } = useAuth();

  useEffect(() => {
    if (authUser) {
      // ✅ Create socket connection
      const newSocket = io("http://localhost:5000", {
        query: { userId: authUser._id },
        autoConnect: true,
      });

      // ✅ Listen for online users
      newSocket.on("getOnlineUsers", (users) => {
        setOnlineUser(users);
      });

      // Optional: log connection events (for debugging)
      newSocket.on("connect", () => console.log("✅ Socket connected"));
      newSocket.on("disconnect", () => console.log("❌ Socket disconnected"));

      setSocket(newSocket);

      // ✅ Cleanup when unmounting or authUser changes
      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    } else {
      // No logged-in user → close existing connection
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
