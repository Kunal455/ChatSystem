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


  const getProfilePicUrl = (pic) => {
    if (!pic)
      return "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";

    if (pic.startsWith("http")) return pic;

    return `${import.meta.env.VITE_API_URL}${pic.startsWith("/") ? pic : `/${pic}`}`;

  };

  const userProfilePic = getProfilePicUrl(authUser?.profilepic);


  return (
    <div className="flex flex-col w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-blue-500/10">

      {/* Search */}
      <div className="flex flex-col p-4 gap-3 border-b border-blue-500/20 bg-gradient-to-r from-slate-800 to-slate-700">
        <form onSubmit={handleSearchSubmit} className="flex items-center bg-slate-700/50 rounded-full shadow-lg px-4 py-2 border border-blue-500/30 focus-within:ring-2 focus-within:ring-blue-400">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search user..."
            className="flex-1 px-2 bg-transparent outline-none text-white placeholder-gray-400 text-sm"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-2 rounded-full ml-2 transition-all transform hover:scale-110 shadow-md"
          >
            <FaSearch size={16} />
          </button>
        </form>
      </div>

      {/* Chat / Search */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin scrollbar-thumb-blue-500/50 scrollbar-track-slate-700/30">
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : searchUser.length > 0 ? (
          <>
            {searchUser.map((user) => (
              <div
                key={user._id}
                onClick={() => handleUserClick(user)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all transform hover:scale-105 ${selectedUserId === user._id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
                    : "hover:bg-slate-700/50 bg-slate-700/30"
                  }`}
              >
                <img
                  src={getProfilePicUrl(user.profilepic)}
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-400"
                />
                <p className="font-semibold text-white">{user.username}</p>
              </div>
            ))}

            <button
              onClick={handleSearchBack}
              className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-600/70 rounded-full px-3 py-2 mt-4 text-gray-300 hover:text-white transition-all border border-blue-500/30"
            >
              <IoArrowBackSharp size={18} /> Back
            </button>
          </>
        ) : chatUser.length === 0 ? (
          <div className="flex flex-col items-center mt-16 text-gray-400 text-center">
            <TiMessages className="text-5xl mb-3 text-blue-400/50" />
            <p className="font-semibold">No chats yet.</p>
            <p className="text-sm text-gray-500">Search a username to start chatting</p>
          </div>
        ) : (
          chatUser.map((user) => (
            <div
              key={user._id}
              onClick={() => handleUserClick(user)}
              className={`flex items-center justify-between px-3 py-3 rounded-lg cursor-pointer transition-all transform hover:scale-105 ${selectedUserId === user._id
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
                  : "hover:bg-slate-700/50 bg-slate-700/30"
                }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="relative">
                  <img
                    src={getProfilePicUrl(user.profilepic)}
                    className="w-10 h-10 rounded-full object-cover border-2 border-blue-400"
                  />
                  {onlineUser.includes(user._id) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></div>
                  )}
                </div>
                <p className="font-semibold text-white truncate">{user.username}</p>
              </div>

              {newMessageUsers[user._id] && (
                <div className="rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-xs text-white px-2 py-1 font-bold shadow-md">
                  +1
                </div>
              )}
            </div>
          ))
        )}
      </div>


      {/* bottom bar */}
      <div className="flex items-center justify-between p-4 border-t border-blue-500/20 bg-gradient-to-r from-slate-900 to-slate-800 shadow-lg">
        <div className="flex items-center gap-3 flex-1">
          <div
            onClick={() => setShowFullImage(true)}
            className="w-12 h-12 rounded-full border-2 border-blue-500 cursor-pointer overflow-hidden hover:scale-110 transition-transform shadow-lg"
          >
            <img src={userProfilePic} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1">
            <p className="font-semibold text-white text-sm">{authUser?.username}</p>
            <p className="text-xs text-gray-400 truncate">{authUser?.email}</p>
          </div>
        </div>

        <BiLogOut
          className="text-red-500 hover:text-red-400 text-2xl cursor-pointer hover:scale-110 transition-all"
          onClick={handleLogOut}
        />
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
