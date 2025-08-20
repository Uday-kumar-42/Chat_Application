import { useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AlertElement from "./AlertElement";
import { motion } from "framer-motion";
import { setUser } from "../store/userSlice";
import { useDispatch } from "react-redux";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const dispatch = useDispatch();
  const [signupStatus, setSignupStatus] = useState({ code: null, msg: null });
  const [validationErrors, setValidationErrors] = useState({
    username: false,
    password: false,
  });

  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || "/";

  async function handleSubmit(e) {
    e.preventDefault();
  
    setValidationErrors({
      username: false,
      password: false,
    });
  
    try {
      const data = {
        username: formData.username.trim(),
        password: formData.password.trim(),
      };
  
      console.log("Sending request with data:", data);
  
      const res = await axios({
        url: "http://localhost:5000/api/auth/signup",
        method: "POST",
        data,
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
  
      console.log("Received response:", res);
  
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
  
        setSignupStatus({ code: 201, msg: res.data.message });
        setFormData({
          username: "",
          password: "",
        });
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 2000);
      }
    } catch (error) {
      console.error("error", error);
  
      if (error.response?.status === 400) {
        const field = error.response.data.field; // Get the exact field from backend
        const message = error.response.data.message;

        console.log(field,message);
  
        if (field) {
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            [field]: true,
          }));
        }
  
        setSignupStatus({ code: 400, msg: message });
      } else {
        setSignupStatus({ code: 500, msg: "Something went wrong" });
      }
    }
  }
  

  return (
    <>
      <AlertElement status={signupStatus} setStatus={setSignupStatus} />
      <motion.div
        className="min-h-[calc(100vh-100px)] bg-black flex items-center justify-center p-4 font-mono"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <motion.div
          className="flex flex-col lg:flex-row w-full max-w-5xl items-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1, transition: { duration: 0.5 } }}
        >
          {/* Image Section */}
          <div className="hidden lg:flex justify-center w-1/2">
            <img
              src="../src/assets/loogin.png"
              alt="Hero"
              className="w-[80%] object-contain"
            />
          </div>

          {/* Form Section */}
          <div className="bg-black w-full max-w-sm p-6 border-2 border-gray-400 shadow-lg rounded-lg">
            <p className="text-2xl font-mono font-bold w-full text-center text-gray-300">
              Get Started
            </p>

            <form>
              {/* Username Input */} {/* Changed from Email Input */}
              <div className="mb-7 relative">
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
                {validationErrors.username && (
                  <span className="label-text text-red-400 absolute bottom-[-20px] left-0  text-[12px]">
                    *not a valid username
                  </span>
                )}
              </div>

              {/* Password Input */}
              <div className="mb-7 relative ">
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
                {validationErrors.password && (
                  <span className="label-text text-red-400 absolute bottom-[-20px] left-0  text-[12px]">
                    *min 6 chars
                  </span>
                )}
              </div>

              {/* Signup Button */} {/* Changed from Login Button */}
              <div className="mb-4">
                <button
                  className="w-full btn btn-outline bg-gray-100 text-black hover:bg-gray-200 font-mono normal-case shadow-none hover:shadow-sm hover:shadow-gray-500"
                  onClick={handleSubmit}
                >
                  Signup
                </button>
              </div>

              {/* Login Link */} {/* Changed from Signup Link */}
              <p className="text-center text-gray-600">
                already have an account?{" "}
                <Link to="/user/login" className="underline text-white">
                  Login
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

export default Signup;
