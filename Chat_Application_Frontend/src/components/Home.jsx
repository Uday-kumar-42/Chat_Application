import { LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../store/userSlice";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function HomePage() {
  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/auth/protected",
          {
            withCredentials: true,
          }
        );

        if (res.status === 201) {
          const { _id, username } = res.data.loggedInUser; 
          console.log(_id, username);
          dispatch(
            setUser({
              _id,
              username, 
              isAuthenticated: true,
            })
          );
        }
      } catch (error) {
        console.log(error.response?.data || "Error checking authentication");
      }
    }

    fetchUser();
  }, [dispatch]);

  return (
    <motion.div
      className="flex items-center justify-center min-h-[80vh] bg-black text-white md:mx-2 lg:mx-6 font-mono px-6 py-4"
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
    >
      <motion.div
        className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-12"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1, transition: { duration: 0.5 } }}
      >
        {/* Left Content */}
        <div className="max-w-lg space-y-5 text-center md:text-left md:w-1/2 lg:ml-8">
          <h1 className="text-4xl lg:text-5xl  font-bold leading-tight">
            Stay Connected, Anytime,Anywhere!
          </h1>
          <p className="text-md text-gray-300">
            Welcome to{" "}
            <span className="font-semibold text-white">Post Your Message</span>,
            the ultimate chat experience designed to keep you connected with the
            people who matter most. Whether you're catching up with friends,
            collaborating with your team, or sharing moments with loved ones,
            our platform makes communication seamless and secure.
          </p>
          <div className="flex justify-center md:justify-start gap-4"> 
            <button className="bg-gray-300 hover:bg-white text-black font-semibold py-3 px-6 rounded-md transition duration-300">
              Get Started
            </button>
            <button className="border-2 border-gray-400 hover:border-white text-gray-300 hover:text-white font-semibold py-3 px-6 rounded-lg transition">
              Login <LogIn className="inline ml-2" />
            </button>
          </div>
        </div>

        {/* Right Image - Moves to top on small screens */}
        <div className="flex justify-center md:w-1/2 order-first md:order-last">
          <img
            src="./src/assets/Texting.png"
            className="w-[250px] md:w-[400px] lg:w-[450px] object-contain rounded-lg shadow-lg"
            alt="Chat Illustration"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default HomePage;
