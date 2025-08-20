import React from "react";
import { useState,useEffect } from "react";

import {
  MoreVerticalIcon,
  LogInIcon,
  LogOutIcon,
  UsersIcon,
  ClockIcon,
  UserIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { addRoom, deleteRoom } from "../store/roomSlice";
import { NavLink, useNavigate } from "react-router-dom";
import AlertElement from "./AlertElement";
import Modal from "./Modal";

function YourRoomsPage() {
  const socket = useSelector((state) => state.user.socket);
  const user = useSelector((state) => state.user.user);
  const rooms = useSelector((state) => state.rooms.rooms) || [];
  const [joiningStatus, setJoiningStatus] = useState({ code: null, msg: null });
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (socket) {
      // Request room info from WebSocket server
      socket.send(
        JSON.stringify({
          type: "request-room-info",
          payLoad: {
            username: user.username, // Changed from email to username
          },
        })
      );

      function messageHandler(message) {
        const parsedMsg = JSON.parse(message.data);
        console.log(parsedMsg);

        const { type, payLoad } = parsedMsg;
        if (type === "request-room-info") {
          // reverse order
          let n = payLoad.length;
          for (let i = n - 1; i >= 0; i--) {
            dispatch(addRoom(payLoad[i]));
          }
        }

        if (type === "error") {
          setJoiningStatus({ code: 500, msg: payLoad.errorMessage });
        }

        if (type === "room-info") {
          setJoiningStatus({ code: 200, msg: "Successfully joined the room" });
          dispatch(addRoom(payLoad));

          setTimeout(() => {
            navigate(`/chat-room/${payLoad.roomId}`);
          }, 1000);
        }

        if (type === "room-data-updated") {
          dispatch(deleteRoom({ roomId: payLoad.roomId }));
        }
      }

      socket.addEventListener("message", messageHandler);

      return () => {
        socket.removeEventListener("message", messageHandler);
      };
    }
  }, [socket, dispatch, user.username, navigate]); // Dependency updated to user.username

  // Toggle dropdown visibility
  const toggleDropdown = (roomId) => {
    if (openDropdown === roomId) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(roomId);
    }
  };

  // Entering the room
  function handleEnter() {
    const roomId = openDropdown;
    if (socket) {
      if (!roomId.trim()) {
        setJoiningStatus({ code: 500, msg: "Room ID cannot be empty" });
        return;
      }

      const msgObj = {
        type: "join",
        payLoad: {
          roomId,
          username: user.username, // Changed from email to username
        },
      };

      socket.send(JSON.stringify(msgObj));
      toggleDropdown(roomId);
    } else {
      // Replaced alert with a console log or a custom modal if needed
      console.error("Error while connecting to server: Socket not available.");
    }
  }

  function handleLeave() {
    setIsOpen(true);
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
      },
    },
  };

  return (
    <>
      {isOpen ? (
        <Modal
          roomId={openDropdown}
          setRoomId={setOpenDropdown}
          setIsOpen={setIsOpen}
          socket={socket}
          user={user}
        />
      ) : (
        ""
      )}

      <AlertElement status={joiningStatus} setStatus={setJoiningStatus} />
      <motion.div
        className="px-4 py-6 bg-black min-h-[calc(100vh-64px)]"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <h1 className="text-2xl font-mono text-white mb-6 flex items-center gap-2">
          <UsersIcon className="h-6 w-6" />
          Your Rooms
        </h1>

        <motion.div
          className="space-y-4 w-full max-w-5xl mx-auto"
          variants={containerVariants}
        >
          {rooms.map((room) => (
            <motion.div
              key={room.roomId}
              className="relative bg-neutral-950 border border-gray-400 rounded-lg shadow-md w-full md:w-4/5 mx-auto"
              variants={itemVariants}
            >
              <div className="p-4 flex flex-col md:flex-row md:items-center relative min-h-[120px] md:min-h-0">
                <div className="flex flex-col md:flex-row md:items-center md:gap-6 pr-8 md:pr-0 md:flex-1">
                  <div className="mb-2 md:mb-0">
                    <div className="text-white font-mono text-lg">
                      {room.roomId}
                    </div>
                    <div className="text-gray-400 font-mono text-xs">
                      Room ID
                    </div>
                  </div>

                  <div className="mb-2 md:mb-0">
                    <div className="text-white font-mono text-base flex items-center gap-1">
                      <UserIcon className="h-4 w-4" />
                      {room.host === user.username ? "you" : room.host} {/* Changed from email to username */}
                    </div>
                    <div className="text-gray-400 font-mono text-xs">Host</div>
                  </div>

                  <div className="mb-2 md:mb-0">
                    <div className="text-white font-mono text-sm flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      {room.createdAt?.split(",")[0] || "??"}
                    </div>
                    <div className="text-gray-400 font-mono text-xs">
                      Created
                    </div>
                  </div>
                </div>

                {/* User count - positioned at bottom right on small/medium screens */}
                <div className="text-gray-300 font-mono text-xs flex items-center gap-1 absolute bottom-4 right-4 md:static md:mr-4">
                  <UsersIcon className="h-4 w-4" />
                  <span>
                    {room.userCount}/{room.maxUsers}
                  </span>
                </div>

                {/* Dropdown trigger - positioned relative to handle the dropdown */}
                <div className="absolute top-2 right-2 md:static md:flex md:items-center">
                  <button
                    onClick={() => toggleDropdown(room.roomId)}
                    className="btn btn-circle text-gray-200 bg-neutral-950 border-none shadow-none hover:bg-neutral-800"
                  >
                    <MoreVerticalIcon className="h-5 w-5" />
                  </button>

                  {/* Dropdown menu - repositioned with fixed z-index */}
                  {openDropdown === room.roomId && (
                    <div className="absolute top-2/3 right-0 mt-1 w-48 bg-black border-2 border-gray-400 rounded-md shadow-lg z-50 overflow-visible">
                      <ul className="py-1">
                        <NavLink to={`/chat-room/${room.roomId}`}>
                          <li>
                            <button
                              className="flex w-full items-center gap-3 px-4 py-2 hover:bg-neutral-900 cursor-pointer transition-all font-mono text-white text-sm"
                              onClick={handleEnter}
                            >
                              <LogInIcon className="h-4 w-4" />
                              Enter Room
                            </button>
                          </li>
                        </NavLink>
                        <li>
                          <button
                            className="flex w-full items-center gap-3 px-4 py-2 hover:bg-neutral-900 cursor-pointer transition-all font-mono text-red-500 text-sm"
                            onClick={handleLeave}
                          >
                            <LogOutIcon className="h-4 w-4" />
                            Leave Room
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </>
  );
}

export default YourRoomsPage;
