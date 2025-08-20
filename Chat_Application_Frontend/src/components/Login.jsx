import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import AlertElement from "./AlertElement";
import { motion } from "framer-motion";
import { setUser } from "../store/userSlice";
import { useDispatch } from "react-redux";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const dispatch = useDispatch();
  const [loginStatus, setLoginStatus] = useState({ code: null, msg: null });
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || "/";

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const data = {
        username: formData.username.trim(),
        password: formData.password.trim(),
      };

      console.log("Sending request with data:", data);

      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.status === 201) {
        const { _id, username } = res.data.loggedInUser; // Changed from email to username
        console.log(_id, username);
        dispatch(
          setUser({
            _id,
            username, // Changed from email to username
            isAuthenticated: true,
          })
        );

        setLoginStatus({ code: 201, msg: "Login successful!" });
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 2000);
      } else {
        setLoginStatus({
          code: 500,
          msg: res.data.message || "Something went wrong",
        });
        setTimeout(() => {}, 2000);
      }
    } catch (error) {
      setLoginStatus({
        code: 400,
        msg: error.response?.data?.message || "Login failed. Please try again",
      });
      setTimeout(() => {}, 2000);
    }
  }

  return (
    <>
      <AlertElement status={loginStatus} setStatus={setLoginStatus} />
      <motion.div
        className="min-h-[calc(100vh-100px)] bg-black flex items-center justify-center p-4 font-mono"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <motion.div
          className="flex flex-col lg:flex-row-reverse w-full max-w-5xl items-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1, transition: { duration: 0.5 } }}
        >
          <div className="hidden lg:flex justify-center w-1/2">
            <img
              src="../src/assets/loogin.png"
              alt="Hero"
              className="w-[80%] object-contain"
            />
          </div>

          <div className="bg-black w-full max-w-sm p-6 border-2 border-gray-400 shadow-lg rounded-lg">
            <p className="text-2xl font-mono font-bold w-full text-center text-gray-300">
              Welcome Back
            </p>

            <form>
              <div className="mb-4">
                <label className="block text-white font-medium">Username</label>
                <input
                  value={formData.username}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...prevData,
                      username: e.target.value,
                    }))
                  }
                  type="text"
                  placeholder="Username"
                  className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black  text-white"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-white font-medium">Password</label>
                <input
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...prevData,
                      password: e.target.value,
                    }))
                  }
                  type="password"
                  placeholder="Password"
                  className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black  text-white"
                  required
                />
              </div>

              <div className="mb-4">
                <button
                  className="w-full btn btn-outline bg-gray-100 text-black hover:bg-gray-200 font-mono normal-case shadow-none hover:shadow-sm hover:shadow-gray-500"
                  onClick={handleSubmit}
                >
                  Login
                </button>
              </div>

              <p className="text-center text-gray-600">
                Don't have an account?{" "}
                <Link to="/user/signup" className="underline text-white">
                  Signup
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

export default Login;
