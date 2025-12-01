import React, { useEffect, useRef, useState } from "react";
import axios from "../../Utils/axiosConfig.js";
import { IoArrowBackSharp, IoSend } from "react-icons/io5";
import { TiMessages } from "react-icons/ti";
import { useAuth } from "../../Context/AuthContext";
import { useSocketContext } from "../../Context/socketContext";
import userConversation from "../../Zustans/useConversation";
import notify from "../../assets/sound/notification.mp3";

const MessageContainer = ({ onBackUser }) => {
  const { messages, selectedConversation, setMessage } = userConversation();
  const { authUser } = useAuth();
  const { socket } = useSocketContext();

  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendData, setSendData] = useState("");
  const lastMessageRef = useRef();

  // NOTE: we don't early-return before hooks (hooks must run always)

  // Fix Image URL
  const getProfilePicUrl = (pic) => {
    if (!pic)
      return "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";
    if (pic.startsWith("http")) return pic;
    return `${import.meta.env.VITE_API_URL}${pic}`;
  };

  // Convert Date to Human Format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      const sound = new Audio(notify);
      sound.play();

      // Normalize senderId shape (populated object vs id string)
      const normalized = { ...newMessage };
      const sender = normalized.senderId && typeof normalized.senderId === "object" ? normalized.senderId._id : normalized.senderId;
      normalized.senderId = String(sender);
      normalized.status = "delivered";

      setMessage((prev) => [...prev, normalized]);
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, setMessage]);

  // Auto-scroll
  useEffect(() => {
    lastMessageRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch messages from backend
  useEffect(() => {
    if (!selectedConversation?._id) return;

    const fetchMessages = async () => {
      setLoading(true);

      try {
        const res = await axios.get(`/api/message/${selectedConversation._id}`);

        const updated = res.data.map((msg) => {
          const sender = msg.senderId && typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId;
          return {
            ...msg,
            senderId: String(sender),
            status: msg.status || "delivered",
          };
        });

        setMessage(updated);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedConversation?._id, setMessage]);

  // ⛔ Prevent wrong color before authUser loads (run after hooks)
  if (!authUser) {
    return (
      <div className="flex items-center justify-center h-full text-gray-600">
        Loading...
      </div>
    );
  }

  // Send Message
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sendData.trim()) return;

    setSending(true);
    try {
      const res = await axios.post(`/api/message/send/${selectedConversation._id}`, {
        message: sendData,
      });

      const newMsg = {
        ...res.data,
        status: "sent",
      };

      // Ensure senderId is normalized (string) so frontend can correctly detect the sender
      if (newMsg.senderId && typeof newMsg.senderId === "object" && newMsg.senderId._id)
        newMsg.senderId = newMsg.senderId._id;
      else if (!newMsg.senderId) newMsg.senderId = authUser._id;

      setMessage((prev) => [...prev, newMsg]);
      setSendData("");
    } catch (error) {
      console.log(error);
    } finally {
      setSending(false);
    }
  };

  // Message Bubble Component
  const MessageBubble = ({ msg }) => {
    // Normalize senderId: it may be a populated object or an id string
    const senderId = msg.senderId && typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId;
    const isSender = String(senderId) === String(authUser._id);

    return (
      <div
        ref={lastMessageRef}
        className={`flex ${isSender ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`px-4 py-3 rounded-3xl max-w-xs break-words shadow-md transition-all ${isSender
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none"
              : "bg-gradient-to-r from-gray-700 to-gray-600 text-gray-100 rounded-bl-none"
            }`}
        >
          {msg.message}

          <div className="flex items-center justify-end gap-1 text-xs mt-2 opacity-80">
            {/* TIME */}
            {new Date(msg.createdAt).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}

            {/* TICKS */}
            {isSender && (
              <span className="ml-1">
                {msg.status === "sent" && "✔"}
                {msg.status === "delivered" && "✔✔"}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden">
      {!selectedConversation ? (
        <div className="flex flex-col items-center justify-center text-white h-full">
          <div className="mb-6"><TiMessages className="text-7xl text-blue-400 drop-shadow-lg" /></div>
          <p className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">Welcome! 👋</p>
          <p className="text-xl font-semibold text-gray-200 mb-2">{authUser.username}</p>
          <p className="text-gray-400 text-center max-w-xs">Select a contact from the sidebar to start messaging</p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 shadow-lg border-b border-blue-500/30 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onBackUser(true)}
                className="bg-white text-sky-700 rounded-full p-1 md:hidden"
              >
                <IoArrowBackSharp size={22} />
              </button>
              <img
                src={getProfilePicUrl(selectedConversation.profilepic)}
                alt="dp"
                className="w-9 h-9 rounded-full object-cover border border-white"
              />
              <span className="font-semibold text-lg">{selectedConversation.username}</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-gradient-to-b from-slate-800 to-slate-900 scrollbar-thin scrollbar-thumb-blue-500/50 scrollbar-track-slate-800/30">
            {loading ? (
              <div className="text-center py-6 text-gray-400">Loading messages...</div>
            ) : (
              <>
                {/* Date grouping */}
                {messages.map((msg, index) => {
                  const showDate =
                    index === 0 ||
                    formatDate(msg.createdAt) !== formatDate(messages[index - 1].createdAt);

                  return (
                    <React.Fragment key={msg._id}>
                      {showDate && (
                        <div className="text-center text-xs text-gray-500 my-3 font-semibold">
                          {formatDate(msg.createdAt)}
                        </div>
                      )}

                      <MessageBubble msg={msg} />
                    </React.Fragment>
                  );
                })}
              </>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-3 bg-gradient-to-r from-slate-800 to-slate-700 border-t border-blue-500/20 p-3 shadow-lg rounded-b-2xl"
          >
            <input
              type="text"
              value={sendData}
              onChange={(e) => setSendData(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-slate-700/50 text-white placeholder-gray-400 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-3 rounded-full transition-all transform hover:scale-105 shadow-lg">
              {sending ? <div className="loading loading-spinner"></div> : <IoSend size={20} />}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default MessageContainer;
