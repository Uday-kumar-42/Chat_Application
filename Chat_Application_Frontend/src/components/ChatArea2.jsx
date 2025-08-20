import React, { useEffect, useRef, useState } from "react";
import {
  SendIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  UserIcon,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { incrementUserCount } from "../store/roomSlice";
import ErrorPage from "./ErrorPage";

const ChatLayout = () => {
  // UI HANDLERS
  const [membersSidebarOpen, setMembersSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [message, setMessage] = useState("");

  function toggleMembersSidebar() {
    setMembersSidebarOpen(!membersSidebarOpen);
  }

  // FUNTIONALITY HANDLERS
  const roomId = useParams().id;
  const [messages, setMessages] = useState([]);
  const socket = useSelector((state) => state.user.socket);
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const rooms = useSelector((state) => state.rooms.rooms);

  // Error handling - protecting against null/undefined values
  const currentRoom = rooms?.find((room) => room?.roomId === roomId);

  // Protect against null/undefined currentRoom
  const members =
    currentRoom?.members?.map((username) => { // Changed from email to username
      return {
        id: username, // Changed from email to username
        name: username, // Using username directly for display name
        username: username, // Storing username
        isAdmin: username === currentRoom.host, // Changed from email to username
      };
    }) || [];

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [messages]);

  useEffect(() => {
    // Scroll to bottom when component mounts
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, []);

  function handleSendMessage() {
    if (socket && message.trim()) {
      const msgObj = {
        type: "msg",
        payLoad: {
          roomId: roomId,
          username: user?.username || "anonymous", // Changed from email to username
          text: message,
        },
      };

      socket.send(JSON.stringify(msgObj));

      const currentTime = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      const newMessage = {
        sender: user?.username || "anonymous", // Changed from email to username
        text: message,
        timestamp: currentTime,
      };
      setMessages((prevData) => [...prevData, newMessage]);
      setMessage("");
    } else if (!socket) {
      // Replaced alert with a console log or a custom modal if needed
      console.error("Error while connecting to server: Socket not available.");
    }
  }

  // Handle message submission with Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle incoming messages
  useEffect(() => {
    if (!socket) return;

    const messageHandler = (message) => {
      try {
        const parsedMsg = JSON.parse(message.data);
        console.log(parsedMsg);

        const { type, payLoad } = parsedMsg;

        if (type === "msg") {
          // Only add the message if it's not from current user (to avoid duplicates)
          if (payLoad.username !== user?.username) { // Changed from email to username
            const newMessage = {
              sender: payLoad.username, // Changed from email to username
              text: payLoad.text,
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            };
            setMessages((prevData) => [...prevData, newMessage]);
          }
        }

        if (type === "new-user-joined") {
          console.log("hi");
          dispatch(incrementUserCount(payLoad));
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    socket.addEventListener("message", messageHandler);

    return () => {
      socket.removeEventListener("message", messageHandler);
    };
  }, [socket, dispatch, user?.username]); // Dependency updated to user?.username

  // Render error page if room doesn't exist
  if (!currentRoom) {
    return <ErrorPage room={true} />;
  }

  return (
    <div className="flex flex-col h-[90vh] bg-black">
      {/* Room Info Bar */}
      <div className="bg-stone-950 border-b border-gray-500 px-4 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-green-400 font-mono text-sm md:text-base">
            Room:{" "}
            <span className="font-bold">
              {currentRoom?.roomName || "Unknown"}
            </span>
          </span>
          <span className="text-green-400 font-mono text-xs ml-4 hidden sm:inline">
            ID: {currentRoom?.roomId || "Unknown"}
          </span>
        </div>
        <div className="text-green-400 font-mono text-sm">
          <span>
            {currentRoom?.userCount || 0}/{currentRoom?.maxUsers || 0} joined
          </span>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-grow overflow-hidden">
        {/* Members sidebar - visible on desktop, hidden on mobile */}
        <div
          className={`bg-stone-950 border-r border-gray-500 overflow-y-auto transition-all duration-300 ease-in-out ${
            membersSidebarOpen ? "w-64 md:block" : "w-0 md:hidden"
          } hidden md:block`}
        >
          <div className="p-3 border-b border-gray-500">
            <h3 className="text-green-400 font-mono font-bold">
              Members ({members.length})
            </h3>
          </div>
          <ul className="p-2 space-y-1">
            {members.map((member) => (
              <li
                key={member.id}
                className="flex items-center p-2 hover:bg-stone-800 rounded transition-colors"
              >
                <div className="w-2 h-2 rounded-full mr-2 bg-gray-200"></div>
                <UserIcon className="h-4 w-4 text-gray-300 mr-2" />
                <span className="text-white font-mono text-sm">
                  {member.name}
                </span>
                {member.isAdmin && (
                  <span className="ml-auto text-xs font-mono text-green-400">
                    Admin
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile members sidebar toggle button */}
        <button
          onClick={toggleMembersSidebar}
          className={`md:hidden fixed ${
            membersSidebarOpen ? "left-64" : "left-0"
          } top-1/2 z-40 bg-stone-900 border border-gray-700 p-1 rounded-r-lg transition-all duration-300`}
        >
          {membersSidebarOpen ? (
            <ChevronLeftIcon className="h-5 w-5 text-green-400" />
          ) : (
            <ChevronRightIcon className="h-5 w-5 text-green-400" />
          )}
        </button>

        {/* Mobile members sidebar */}
        <div
          className={`fixed top-0 left-0 h-full overflow-y-auto transition-transform duration-300 ease-in-out bg-stone-900 border-r border-gray-700 z-40 md:hidden ${
            membersSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-0"
          }`}
        >
          <div className="p-3 border-b border-gray-700">
            <h3 className="text-green-400 font-mono font-bold">
              Members ({members.length})
            </h3>
          </div>
          <ul className="p-2 space-y-1">
            {members.map((member) => (
              <li
                key={member.id}
                className="flex items-center p-2 hover:bg-stone-800 rounded transition-colors"
              >
                <div className={"w-2 h-2 rounded-full mr-2 bg-gray-200"}></div>
                <UserIcon className="h-4 w-4 text-gray-300 mr-2" />
                <span className="text-white font-mono text-sm">
                  {member.username} {/* Changed from email to username */}
                </span>
                {member.isAdmin && (
                  <span className="ml-auto text-xs font-mono text-green-400">
                    Admin
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Messages area */}
        <div className="flex-grow flex flex-col bg-stone-950 relative">
          {/* Messages container */}
          <div
            ref={messagesContainerRef}
            className="flex-grow overflow-y-auto p-4 space-y-4"
          >
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 font-mono text-sm">
                  No messages yet. Start the conversation!
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className="flex flex-col">
                  <div className="flex items-baseline">
                    <span
                      className={`font-mono text-green-400 text-sm font-semibold ${
                        message.sender === user.username ? "ml-auto" : "" // Changed from email to username
                      }`}
                    >
                      {index === 0 ||
                      messages[index - 1]?.sender !== message.sender
                        ? message.sender
                        : ""}
                    </span>
                    <span className="ml-2 text-gray-500 text-xs font-mono">
                      {message.timestamp}
                    </span>
                  </div>
                  <p
                    className={`text-white font-mono text-sm mt-1 px-3 py-2 rounded-lg  shadow-md max-w-[60%] break-words ${
                      message.sender === user.username // Changed from email to username
                        ? "ml-auto bg-neutral-900"
                        : "mr-auto bg-stone-800"
                    }`}
                  >
                    {message.text}
                  </p>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <div className="p-3 ">
            <div className="flex">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                onKeyDown={handleKeyPress}
                className="flex-grow bg-black border-1 border-gray-500 text-white p-2 rounded-l-md font-mono focus:outline-none focus:ring-1 focus:border-gray-500"
              />
              <button
                className="bg-gray-200 text-black px-4 py-2 rounded-r-md font-mono hover:bg-gray-400 transition-colors"
                onClick={handleSendMessage}
              >
                <SendIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;
