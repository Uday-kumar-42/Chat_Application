import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function ErrorPage({ room }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-black text-white px-6">
      <motion.img
        src="../src/assets/404-error.png"
        alt="Page Not Found"
        className=" w-3/5 sm:w-2/5 md:w-1/4 rounded-lg shadow-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      />
      <motion.h1
        className="text-4xl font-bold mb-4 text-gray-300"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {room ? "Room Not Found" : "404 - Page Not Found"}
      </motion.h1>
      <p className="text-gray-400 mb-6 text-center max-w-md">
        {room
          ? "Oops! The Room you are looking for doesn’t exist or has been moved."
          : "Oops! The page you are looking for doesn’t exist or has been moved."}
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-white text-black rounded-lg font-semibold shadow-lg hover:bg-gray-200 transition-all duration-300"
      >
        Go Back Home
      </Link>
    </div>
  );
}

export default ErrorPage;
