import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { incrementUserCount } from "../store/roomSlice";
import ErrorPage from "./ErrorPage";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function ChatArea() {
  const roomId = useParams().id;
  const [messages, setMessages] = useState([]);
  const socket = useSelector((state) => state.user.socket);
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const rooms = useSelector((state) => state.rooms.rooms);
  const currentRoom = rooms.find((room) => room.roomId === roomId);

  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [messages]);

  function handleSendMessage() {
    if (socket && message.trim()) {
      const msgObj = {
        type: "msg",
        payLoad: {
          roomId: roomId,
          username: user.username, // Changed from email to username
          text: message,
        },
      };

      socket.send(JSON.stringify(msgObj));
      setMessages((prevData) => [
        ...prevData,
        { sender: user.username, text: message },
      ]);
      setMessage("");
    } else if (!socket) {
      // Replaced alert with a console log or a custom modal if needed
      console.error("Error while connecting to server: Socket not available.");
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (!socket) return;

    const messageHandler = (message) => {
      const parsedMsg = JSON.parse(message.data);
      const { type, payLoad } = parsedMsg;

      if (type === "msg") {
        // Check sender using username
        if (payLoad.username !== user.username) { // Changed from email to username
          setMessages((prevData) => [
            ...prevData,
            { sender: payLoad.username, text: payLoad.text }, // Changed from email to username
          ]);
        }
      }

      if (type === "new-user-joined") {
        dispatch(incrementUserCount(payLoad));
      }
    };

    socket.addEventListener("message", messageHandler);

    return () => {
      socket.removeEventListener("message", messageHandler);
    };
  }, [socket, dispatch, user.username]); // Dependency updated to user.username

  if (!currentRoom) {
    return <ErrorPage room={true} />;
  }

  return (
    <motion.div
      className="flex items-center justify-center py-4 bg-black min-h-[calc(100vh-64px)]"
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
    >
      <motion.div
        className="w-full max-w-md flex flex-col h-[calc(100vh-64px)] rounded-lg border border-gray-400 bg-black"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1, transition: { duration: 0.5 } }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-400">
          <h1 className="text-xl font-mono text-white flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            Real Time Chat
          </h1>
          <p className="text-xs text-gray-400 font-mono">
            temporary room that expires after all users exit
          </p>
        </div>

        {/* Room Info */}
        <div className="p-2 bg-neutral-900 border-b border-gray-400 flex justify-between items-center">
          <div className="font-mono text-sm text-gray-300">
            Room Code: <span className="font-bold">{roomId}</span>
          </div>
          <div className="font-mono text-xs text-gray-400">
            Users: {currentRoom.userCount}/{currentRoom.maxUsers}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-grow p-4 overflow-y-auto bg-black">
          <div className="space-y-3">
            {messages.map((msg, index) => (
              <div key={index} className="message-container mb-3">
                <div
                  className={`flex ${
                    msg.sender !== user.username // Changed from email to username
                      ? "justify-start"
                      : "justify-end"
                  }`}
                >
                  <div className="message-content">
                    <div
                      className={`text-xs font-mono ${
                        msg.sender !== user.username // Changed from email to username
                          ? "text-gray-400 text-left ml-1"
                          : "text-gray-400 text-right mr-1"
                      } mb-1`}
                    >
                      {msg.sender === user.username ? "you" : msg.sender} {/* Changed from email to username */}
                    </div>
                    <div
                      className={`px-3 py-2 rounded-lg text-sm font-mono ${
                        msg.sender !== user.username // Changed from email to username
                          ? "bg-neutral-800 text-gray-200 mr-12"
                          : "bg-gray-200 text-black ml-12"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-400 flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="input input-bordered flex-grow bg-neutral-900 border-gray-400 text-white font-mono text-sm"
            onKeyPress={handleKeyPress}
          />
          <button
            className="btn btn-md bg-white text-black hover:bg-gray-200 normal-case font-mono shadow-none hover:shadow-sm hover:shadow-gray-500"
            onClick={handleSendMessage}
          >
            Send
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ChatArea;
