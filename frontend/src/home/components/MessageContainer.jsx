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

  // ⛔ Prevent wrong color before authUser loads
  if (!authUser) {
    return (
      <div className="flex items-center justify-center h-full text-gray-600">
        Loading...
      </div>
    );
  }

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

      newMessage.status = "delivered";

      setMessage((prev) => [...prev, newMessage]);
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket]);

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

        const updated = res.data.map((msg) => ({
          ...msg,
          status: msg.status || "delivered",
        }));

        setMessage(updated);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedConversation?._id]);

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
    const isSender = msg.senderId === authUser._id;

    return (
      <div
        ref={lastMessageRef}
        className={`flex ${isSender ? "justify-end" : "justify-start"}`}
      >
        <div
          className="px-4 py-2 rounded-2xl max-w-xs break-words shadow-sm"
          style={{
            backgroundColor: isSender ? "#D4F8D4" : "#FFF4D6",
            color: "#333",
          }}
        >
          {msg.message}

          <div className="flex items-center justify-end gap-1 text-[10px] opacity-70 mt-1">
            {/* TIME */}
            {new Date(msg.createdAt).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}

            {/* TICKS */}
            {isSender && (
              <span>
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
    <div className="flex flex-col w-full h-full p-3 bg-gray-50">
      {!selectedConversation ? (
        <div className="flex flex-col items-center justify-center text-gray-700 h-full">
          <p className="text-2xl font-semibold">Welcome 👋 {authUser.username}!</p>
          <p className="text-sm mb-3">Select a chat to start messaging</p>
          <TiMessages className="text-5xl text-sky-600" />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between bg-sky-600 text-white rounded-lg px-3 py-2 mb-2 shadow">
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
          <div className="flex-1 overflow-y-auto px-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
            {loading ? (
              <div className="text-center py-4 text-gray-600">Loading...</div>
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
                        <div className="text-center text-xs text-gray-500 my-2">
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
            className="flex items-center bg-white rounded-full p-2 mt-2 shadow-sm"
          >
            <input
              type="text"
              value={sendData}
              onChange={(e) => setSendData(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-transparent outline-none px-3 text-gray-800"
            />
            <button type="submit" className="text-sky-700 hover:text-sky-800 transition-colors">
              {sending ? <div className="loading loading-spinner"></div> : <IoSend size={25} />}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default MessageContainer;
