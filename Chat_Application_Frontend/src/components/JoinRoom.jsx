import { useEffect, useState } from "react";
import RoomCreation from "./RoomCreation";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AlertElement from "./AlertElement";
import { addRoom } from "../store/roomSlice";

function JoinRoom() {
  const socket = useSelector((state) => state.user.socket);
  const user = useSelector((state) => state.user.user);
  const [roomId, setRoomId] = useState("");
  const [isJoining, setIsJoining] = useState(false); // New state to track loading
  const [joiningStatus, setJoiningStatus] = useState({ code: null, msg: null });
  const dispatch = useDispatch();
  const navigate = useNavigate();
 
  function handleUpperCase(e) {
    setRoomId(e.target.value.toUpperCase());
  }

  useEffect(() => {
    if (socket) {
      function messageHandler(message) {
        const parsedMsg = JSON.parse(message.data);
        console.log(parsedMsg);

        const { type, payLoad } = parsedMsg;

        if (type === "error") {
          setJoiningStatus({ code: 500, msg: payLoad.errorMessage });
          setIsJoining(false); // Stop loading on error
        }

        if (type === "room-info") {
          setJoiningStatus({ code: 200, msg: "Successfully joined the room" });
          dispatch(addRoom(payLoad));

          setTimeout(() => {
            navigate(`/chat-room/${roomId}`);
          }, 2000);
        }
      }

      socket.addEventListener("message", messageHandler);

      return () => {
        socket.removeEventListener("message", messageHandler);
      };
    }
  }, [socket, navigate, roomId, dispatch]);

  function handleJoinRoom() {
    if (socket) {
      if (!roomId.trim()) {
        setJoiningStatus({ code: 500, msg: "Room ID cannot be empty" });
        return;
      }

      setIsJoining(true); // Start loading

      const msgObj = {
        type: "join",
        payLoad: {
          roomId,
          username: user.username, // Changed from email to username
        },
      };

      socket.send(JSON.stringify(msgObj));
    } else {
      // Replaced alert with a console log or a custom modal if needed
      console.error("Error while connecting to server: Socket not available.");
    }
  }

  return (
    <>
      <AlertElement status={joiningStatus} setStatus={setJoiningStatus} />
      <RoomCreation>
        <div className="mt-4 flex items-center gap-2">
          <input
            value={roomId}
            type="text"
            placeholder="Enter Room Code"
            className="input input-bordered w-full bg-neutral-900 border-gray-400 text-white font-mono text-sm"
            onChange={handleUpperCase}
            disabled={isJoining} // Disable input while joining
          />
          <button
            className={`btn btn-md bg-gray-100 text-black hover:bg-gray-200 normal-case font-mono shadow-none hover:shadow-sm hover:shadow-gray-500 ${
              isJoining ? "text-white" : ""
            }`}
            onClick={handleJoinRoom}
            disabled={isJoining} // Disable button while joining
          >
            {isJoining ? "Joining..." : "Join Room"}
          </button>
        </div>
      </RoomCreation>
    </>
  );
}

export default JoinRoom;
