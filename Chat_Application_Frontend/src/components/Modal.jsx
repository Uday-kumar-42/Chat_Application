import { motion } from "framer-motion";

function Modal({ roomId, setRoomId, setIsOpen, socket, user }) {
  function handleClose() {
    setRoomId(null);
    setIsOpen(false);
  }

  function handleConfirm() {
    const msgObj = {
      type: "leave-room",
      payLoad: {
        roomId,
        username: user.username, // Changed from email to username
      },
    };
 
    socket.send(JSON.stringify(msgObj));
    setIsOpen(false);
    setRoomId(null);
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[70] bg-black/60 backdrop-blur-[2px] ">
      <motion.div
        initial={{ y: 30, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative bg-neutral-950 border border-gray-500 shadow-2xl rounded-xl p-4 w-[90%] max-w-md"
      >
        <div className="text-xl text-white font-mono text-center">
          RoomId : {roomId}
        </div>
        <div className="text-stone-400 font-mono text-md text-center py-4">
          Leaving now will disconnect you from the conversation.Do you want to
          continue?
        </div>

        <div className="mt-2 flex justify-center space-x-4">
          <button
            onClick={handleClose}
            className="px-5 py-2 text-sm bg-red-600 hover:bg-red-500 text-white cursor-pointer font-mono rounded-lg shadow-md transition-transform transform hover:scale-103 min-w-20"
          >
            NO
          </button>

          <button
            onClick={handleConfirm}
            className="px-5 py-2 text-sm bg-gray-200 hover:bg-gray-400 text-black font-mono rounded-lg shadow-md transition-transform transform hover:scale-103 min-w-20"
          >
            YES
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default Modal;
