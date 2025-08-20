import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../store/userSlice";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const navigate = useNavigate();
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
          const { _id, username } = res.data.loggedInUser; // Ensure username is destructured
          console.log(_id, username);
          dispatch(
            setUser({
              _id,
              username, // Use username here
              isAuthenticated: true,
            })
          );

          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
        console.log(error.response?.data || "Error checking authentication");
      }
    }

    fetchUser();
  }, [dispatch]);

  // Redirect only after authentication is confirmed
  useEffect(() => {
    if (isAuthenticated === false) {
      navigate("/user/login");
    }
  }, [isAuthenticated, navigate]);

  // Block rendering until authentication is checked
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <span className="loading loading-infinity loading-xl text-white"></span>
      </div>
    );
  }

  return isAuthenticated ? children : null;
};

export default ProtectedRoute;
