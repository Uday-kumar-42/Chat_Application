import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { addRoom } from "../store/roomSlice";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function RoomCreation({ children }) {
  const socket = useSelector((state) => state.user.socket);
  const user = useSelector((state) => state.user.user);
  const roomName = useRef();
  const maxUsers = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isnavigating, setIsNavigating] = useState(false);

  function handleNavigate() {
    setIsNavigating(true);
    setTimeout(() => {
      navigate("/create/new-room");
    }, 2000);
  }

  useEffect(() => {
    if (!socket) return; // Prevent running if socket is null/undefined

    function messageHandler(message) {
      const parsedMsg = JSON.parse(message.data);
      console.log(parsedMsg);

      const { type, payLoad } = parsedMsg;

      if (type === "room-info") {
        dispatch(addRoom(payLoad));
      }
    }

    socket.addEventListener("message", messageHandler);

    return () => {
      socket.removeEventListener("message", messageHandler);
    };
  }, [socket, dispatch]);

  function handleCreateRoom() {
    if (socket) {
      // generation of room-code
      const str = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890";
      let roomId = "";
      for (let i = 0; i < 6; i++) {
        roomId += str.charAt(Math.random() * str.length);
      }

      // joining the room
      const msgObj = {
        type: "create",
        payLoad: {
          roomId: roomId,
          username: user.username, // Changed from email to username
          roomName : roomName.current.value || "Untitiled-room",
          maxUsers: Number(maxUsers.current.value) || 15,
        },
      };

      socket.send(JSON.stringify(msgObj));
      console.log(`room created with id : ${roomId}`);
      setIsNavigating(true);

      // navigate to the chat room after two seconds
      setTimeout(() => {
        navigate(`/chat-room/${roomId}`);
      }, 2000);
    } else {
      // Replaced alert with a console log or a custom modal if needed
      console.error("Connection Error! Please try again later.");
    }
  }

  if (isnavigating) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <span className="loading loading-infinity loading-xl text-white"></span>
      </div>
    );
  }

  return (
    <motion.div
      className="flex items-center justify-center min-h-[80vh] bg-black"
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
    >
      <motion.div
        className="w-full max-w-md p-6 rounded-lg border border-gray-400 bg-black"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1, transition: { duration: 0.5 } }}
      >
        <div className="text-center mb-2">
          <h1 className="text-xl font-mono text-white flex items-center justify-center gap-2">
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
            Temporary room that expires after all users exit
          </p>
        </div>

        {children ? (
          <div className="mt-6 flex items-center gap-2">
            <button
              className="btn btn-outline bg-gray-100 w-full text-black hover:bg-gray-200 font-mono normal-case shadow-none hover:shadow-sm hover:shadow-gray-500"
              onClick={handleNavigate}
            >
              Create New Room
            </button>
          </div>
        ) : (
          <div className="flex-col space-y-4 mt-6">
            <div>
              <input
                ref={roomName}
                type="text"
                placeholder="room-name"
                className="input input-bordered w-full bg-neutral-900 border-gray-400 text-white font-mono text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={maxUsers}
                type="text"
                placeholder="max-users"
                className="input input-bordered w-full bg-neutral-900 border-gray-400 text-white font-mono text-sm"
              />
              <button
                className="btn btn-outline bg-gray-100 w-[60%] text-black hover:bg-gray-200 font-mono normal-case shadow-none hover:shadow-sm hover:shadow-gray-500"
                onClick={handleCreateRoom}
              >
                Create New Room
              </button>
            </div>
          </div>
        )}

        {children}
      </motion.div>
    </motion.div>
  );
}

export default RoomCreation;
