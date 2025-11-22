import React, { useState, useEffect } from "react";
import axios from "../../utils/axiosConfig";
import { toast } from "react-toastify";
import { FaSearch } from "react-icons/fa";
import { IoArrowBackSharp } from "react-icons/io5";
import { BiLogOut } from "react-icons/bi";
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

  // 🔔 Listen for incoming messages
  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (newMessage) => {
      if (newMessage.receiverId === authUser?._id) {
        setNewMessageUsers((prev) => ({
          ...prev,
          [newMessage.senderId]: true,
        }));
        new Audio(notify).play();
      }
    };
    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, authUser?._id]);

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
      if ((res.data?.length ?? 0) === 0) toast.info("User not found");
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

    // Clear unread badge
    setNewMessageUsers((prev) => ({ ...prev, [user._id]: false }));
  };

  const handleSearchBack = () => {
    setSearchUser([]);
    setSearchInput("");
  };

  const handleLogOut = async () => {
    try {
      // Call logout endpoint to clear cookie on server
      await axios.post("/api/auth/logout");
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem("chatapp");
      setAuthUser(null);
      navigate("/login");
    }
  };

  const getProfilePicUrl = (pic) => {
    if (!pic)
      return "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";
    if (pic.startsWith("http")) return pic;
    return `http://localhost:5000${pic.startsWith("/") ? pic : `/${pic}`}`;
  };

  const userProfilePic = getProfilePicUrl(authUser?.profilepic);

  return (
    <div className="flex flex-col w-full h-full bg-gradient-to-b from-sky-100 to-sky-50 rounded-xl shadow-lg overflow-hidden">
      {/* Search */}
      <div className="flex flex-col p-4 gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center bg-white rounded-full shadow px-3 py-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search user..."
            className="flex-1 px-3 bg-transparent outline-none text-gray-700"
          />
          <button
            type="submit"
            className="bg-sky-700 hover:bg-sky-900 text-white p-2 rounded-full ml-2"
          >
            <FaSearch />
          </button>
        </form>
      </div>

      {/* Chat / Search Results */}
      <div className="flex-1 overflow-y-auto px-4 space-y-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
        {loading ? (
          <div className="text-center py-5 text-gray-600">Loading...</div>
        ) : searchUser.length > 0 ? (
          <>
            {searchUser.map((user) => (
              <div
                key={user._id}
                onClick={() => handleUserClick(user)}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${selectedUserId === user._id ? "bg-sky-200" : "hover:bg-sky-100"
                  }`}
              >
                <img
                  src={getProfilePicUrl(user.profilepic)}
                  alt={user.username}
                  className={`w-10 h-10 rounded-full object-cover ${onlineUser?.includes(user._id) ? "ring-2 ring-green-500" : ""
                    }`}
                />
                <p className="font-semibold text-gray-800">{user.username}</p>
              </div>
            ))}
            <button
              onClick={handleSearchBack}
              className="flex items-center gap-2 bg-gray-200 rounded-full px-3 py-1 mt-3"
            >
              <IoArrowBackSharp size={20} /> Back
            </button>
          </>
        ) : chatUser.length === 0 ? (
          <div className="flex flex-col items-center mt-10 text-gray-600">
            <p>Why are you alone? 🤔</p>
            <p>Search username to chat</p>
          </div>
        ) : (
          chatUser.map((user) => (
            <div
              key={user._id}
              onClick={() => handleUserClick(user)}
              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${selectedUserId === user._id ? "bg-sky-200" : "hover:bg-sky-100"
                }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={getProfilePicUrl(user.profilepic)}
                  alt={user.username}
                  className={`w-10 h-10 rounded-full object-cover ${onlineUser?.includes(user._id) ? "ring-2 ring-green-500" : ""
                    }`}
                />
                <p className="font-semibold text-gray-800">{user.username}</p>
              </div>

              {newMessageUsers[user._id] ? (
                <div className="rounded-full bg-green-700 text-sm text-white px-[6px]">
                  +1
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>

      {/* Bottom DP + Email + Logout */}
      <div className="flex items-center justify-between p-4 border-t border-gray-300 bg-white/70">
        <div className="flex items-center gap-3">
          <div
            onClick={() => setShowFullImage(true)}
            className="w-12 h-12 rounded-full border-2 border-green-500 cursor-pointer overflow-hidden"
          >
            <img src={userProfilePic} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <p className="font-semibold text-gray-800">{authUser?.username}</p>
            <p className="text-sm text-gray-500 truncate max-w-[120px]">{authUser?.email ?? "No email"}</p>
          </div>
        </div>
        <BiLogOut
          className="text-red-600 text-2xl cursor-pointer hover:scale-110 transition"
          onClick={handleLogOut}
        />
      </div>

      {/* Full Profile Modal */}
      {showFullImage && (
        <div
          className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 cursor-pointer"
          onClick={() => setShowFullImage(false)}
        >
          <img
            src={userProfilePic}
            alt="Full"
            className="w-72 h-72 rounded-xl shadow-lg border border-white object-cover"
          />
        </div>
      )}
    </div>
  );
};

export default Sidebar;
