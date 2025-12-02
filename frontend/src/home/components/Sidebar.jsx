import React, { useState, useEffect, useRef } from "react";
import axios from "../../Utils/axiosConfig.js";
import { toast } from "react-toastify";
import { FaSearch } from "react-icons/fa";
import { IoArrowBackSharp } from "react-icons/io5";
import { BiLogOut } from "react-icons/bi";
import { TiMessages } from "react-icons/ti";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { useSocketContext } from "../../Context/socketContext";
import userConversation from "../../Zustans/useConversation";
import notify from "../../assets/sound/notification.mp3";

const Sidebar = ({ onSelectUser }) => {
  const navigate = useNavigate();
  const { authUser, setAuthUser } = useAuth();
  const { socket, onlineUser } = useSocketContext();

  const { setSelectedConversation } = userConversation();

  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchUser, setSearchUser] = useState([]);
  const [chatUser, setChatUser] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessageUsers, setNewMessageUsers] = useState({});
  const [showFullImage, setShowFullImage] = useState(false);

  // 🔊 preload sound
  const notifSound = useRef(new Audio(notify)).current;

  // 🔔 Listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      if (newMessage.receiverId === authUser?._id) {
        setNewMessageUsers((prev) => ({
          ...prev,
          [newMessage.senderId]: true,
        }));
        notifSound.play();
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, authUser?._id, notifSound]);


  // 👤 Fetch chat users
  useEffect(() => {
    const fetchChatUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/user/currentchatters");
        setChatUser(Array.isArray(res.data) ? res.data : res.data?.users ?? []);
      } catch {
        toast.error("Failed to load chat users");
      } finally {
        setLoading(false);
      }
    };
    fetchChatUsers();
  }, []);


  // 🔍 Search users
  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    if (!searchInput.trim()) return toast.info("Please enter a username");

    setLoading(true);
    try {
      const res = await axios.get(`/api/user/search?search=${encodeURIComponent(searchInput)}`);

      setSearchUser(Array.isArray(res.data) ? res.data : res.data?.users ?? []);

      if (!res.data?.users?.length) toast.info("User not found");
    } catch {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user) => {
    onSelectUser(user);
    setSelectedConversation(user);
    setSelectedUserId(user._id);

    setNewMessageUsers((prev) => ({ ...prev, [user._id]: false }));
  };

  const handleSearchBack = () => {
    setSearchUser([]);
    setSearchInput("");
  };


  const handleLogOut = async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      localStorage.removeItem("chatapp");
      setAuthUser(null);
      navigate("/login");
    }
  };


  const getProfilePicUrl = (pic, username) => {
    // Use custom picture if uploaded (HTTP URL or local path)
    if (pic) {
      if (pic.startsWith("http")) return pic;
      return `${import.meta.env.VITE_API_URL}${pic.startsWith("/") ? pic : `/${pic}`}`;
    }
    // Generate unique cartoon avatar from username using Dicebear
    const seed = username || "default";
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
  };

  const userProfilePic = getProfilePicUrl(authUser?.profilepic, authUser?.username);


  return (
    <div className="flex flex-col w-full h-full bg-white/5 backdrop-blur-md overflow-hidden border border-white/10 shadow-2xl">

      {/* Header */}
      <div className="px-6 py-5 border-b border-white/10 bg-white/5">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Messages</h1>
        <p className="text-xs text-gray-300 mt-1">Your conversations</p>
      </div>

      {/* Search */}
      <div className="flex flex-col p-5 gap-3 border-b border-white/10 bg-white/5">
        <form onSubmit={handleSearchSubmit} className="flex items-center bg-white/10 rounded-xl shadow-lg px-5 py-3 border border-white/20 focus-within:ring-2 focus-within:ring-cyan-400 transition-all">
          <FaSearch size={18} className="text-cyan-400 mr-3" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search users..."
            className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 text-sm font-medium"
          />
        </form>
      </div>

      {/* Chat / Search */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-white/5">
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Loading conversations...</div>
        ) : searchUser.length > 0 ? (
          <>
            {searchUser.map((user) => (
              <div
                key={user._id}
                onClick={() => handleUserClick(user)}
                className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 ${selectedUserId === user._id ? "bg-white/20 shadow-lg border border-cyan-400/50" : "hover:bg-white/10 bg-white/5"}`}
              >
                <img
                  src={getProfilePicUrl(user.profilepic, user.username)}
                  className="w-12 h-12 rounded-full object-cover border-2 border-cyan-400/60 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{user.username}</p>
                  <p className="text-xs text-gray-300">Start conversation</p>
                </div>
              </div>
            ))}

            <button
              onClick={handleSearchBack}
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl px-4 py-3 mt-4 text-gray-300 hover:text-white transition-all border border-white/20 w-full"
            >
              <IoArrowBackSharp size={18} /> Back
            </button>
          </>
        ) : chatUser.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center py-16">
            <TiMessages className="text-6xl mb-4 text-cyan-400/40" />
            <p className="font-semibold text-lg">No conversations yet</p>
            <p className="text-sm text-gray-400 mt-2">Search for someone to start messaging</p>
          </div>
        ) : (
          chatUser.map((user) => (
            <div
              key={user._id}
              onClick={() => handleUserClick(user)}
              className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-200 ${selectedUserId === user._id ? "bg-white/20 shadow-lg border border-cyan-400/50" : "hover:bg-white/10 bg-white/5"}`}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <img
                    src={getProfilePicUrl(user.profilepic, user.username)}
                    className="w-12 h-12 rounded-full object-cover border-2 border-cyan-400/60"
                  />
                  {onlineUser.includes(user._id) && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-gray-900 shadow-lg"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate text-sm">{user.username}</p>
                  <p className="text-xs text-gray-400">{onlineUser.includes(user._id) ? "Active now" : "Offline"}</p>
                </div>
              </div>

              {newMessageUsers[user._id] && (
                <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-xs text-white font-bold shadow-lg">•</div>
              )}
            </div>
          ))
        )}
      </div>


      {/* Profile bar */}
      <div className="flex items-center justify-between p-5 border-t border-white/10 bg-white/5 shadow-2xl">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div
            onClick={() => setShowFullImage(true)}
            className="w-14 h-14 rounded-full border-2 border-cyan-400/60 cursor-pointer overflow-hidden hover:scale-110 transition-all shadow-lg flex-shrink-0 hover:border-cyan-400"
          >
            <img src={userProfilePic} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm">{authUser?.username}</p>
            <p className="text-xs text-gray-400 truncate">{authUser?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogOut}
          className="ml-3 p-2 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-red-300 transition-all flex-shrink-0 border border-red-500/30 hover:border-red-500/60"
          title="Logout"
        >
          <BiLogOut size={20} />
        </button>
      </div>


      {showFullImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 cursor-pointer"
          onClick={() => setShowFullImage(false)}
        >
          <img
            src={userProfilePic}
            className="w-80 h-80 rounded-2xl object-cover border-4 border-blue-500 shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};

export default Sidebar;

