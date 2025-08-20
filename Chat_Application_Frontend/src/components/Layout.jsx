import React, { useState } from "react";
import { motion } from "framer-motion";
import { setUser } from "../store/userSlice";
import axios from "axios";
import AlertElement from "./AlertElement";

import {
  MenuIcon,
  XIcon,
  PlusCircleIcon,
  UsersIcon,
  HomeIcon,
  LogOutIcon,
  MessageCircleMoreIcon,
  LayoutList,
  LogInIcon,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

function LayoutPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useSelector((state) => state.user.user);
  const [logoutStatus, setLogoutStatus] = useState({ code: null, msg: null });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  async function handleLogout() {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        { withCredentials: true }
      );

      if (res.status == 200) {
        dispatch(setUser(null));

        setLogoutStatus({ code: 201, msg: "Logout successful!" });
        setTimeout(() => {
          navigate("user/login", { replace: true });
        }, 2000);
      }
    } catch (error) {
      setLogoutStatus({ code: 500, msg: "Something went wrong..!" });
      console.error("Logout error:", error);
    }
  }

  return (
    <>
      <AlertElement status={logoutStatus} setStatus={setLogoutStatus} />
      <div className="flex flex-col min-h-screen bg-black">
        {/* Navbar - Fixed at top */}
        <div className="navbar bg-black border-b-2 border-gray-400 sticky top-0 p-0 z-50">
          <div className="navbar-start">
            <button
              onClick={toggleSidebar}
              className="btn btn-circle bg-black border-none shadow-none hover:bg-stone-800"
            >
              <MenuIcon className="h-5 w-5 text-white" />
            </button>
          </div>
          <div className="navbar-center">
            <div className="text-xl font-mono text-white flex items-center gap-2">
              <MessageCircleMoreIcon className="h-5 w-5 mb-1" />
              Post your message
            </div>
          </div>
          <div className="navbar-end">
            {/* Empty div to maintain centered logo */}
          </div>
        </div>

        <div className="flex flex-col flex-grow">
          {/* Main content area with sidebar and outlet */}
          <div className="flex flex-grow relative">
            {/* Sidebar */}
            <div
              className={`fixed top-0 left-0 h-full w-64 bg-black border-r-2 border-gray-400 z-50 overflow-y-auto transition-transform duration-300 ease-in-out ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <div className="py-[10px] space-y-3">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-mono text-white pl-4">Menu</h2>
                  <button
                    onClick={toggleSidebar}
                    className="btn btn-circle bg-black border-none shadow-none hover:bg-stone-800"
                  >
                    <XIcon className="h-5 w-5 text-white" />
                  </button>
                </div>

                <div className="divider my-2 border-b-2 border-gray-400 h-px"></div>

                <ul className="space-y-3 px-1">
                  <NavLink to="/create/new-room">
                    <li>
                      <p className="flex items-center gap-3 px-2 py-2 hover:bg-neutral-700 transition-all rounded-md w-full font-mono text-white text-sm">
                        <PlusCircleIcon className="h-5 w-5" />
                        Create a Room
                      </p>
                    </li>
                  </NavLink>
                  <NavLink to="/join/new-room">
                    <li>
                      <p className="flex items-center gap-3 px-2 py-2 hover:bg-neutral-700 transition-all rounded-md w-full font-mono text-white text-sm">
                        <UsersIcon className="h-5 w-5" />
                        Join a Room
                      </p>
                    </li>
                  </NavLink>
                  <NavLink to="/your-rooms">
                    <li>
                      <p className="flex items-center gap-3 px-2 py-2 hover:bg-neutral-700 transition-all rounded-md w-full font-mono text-white text-sm">
                        <LayoutList className="h-5 w-5" />
                        Your Rooms
                      </p>
                    </li>
                  </NavLink>
                  <NavLink to="/">
                    <li>
                      <p className="flex items-center gap-3 px-2 py-2 hover:bg-neutral-700 transition-all rounded-md w-full font-mono text-white text-sm">
                        <HomeIcon className="h-5 w-5" />
                        Home
                      </p>
                    </li>
                  </NavLink>
                  {user !== null ? (
                    <li className="cursor-pointer" onClick={handleLogout}>
                      <p className="flex items-center gap-3 px-2 py-2 hover:bg-neutral-700 transition-all rounded-md w-full font-mono text-gray-400 text-sm mt-8">
                        <LogOutIcon className="h-5 w-5" />
                        Log Out
                      </p>
                    </li>
                  ) : (
                    <NavLink to="/user/login">
                      <li>
                        <p className="flex items-center gap-3 px-2 py-2 hover:bg-neutral-700 transition-all rounded-md w-full font-mono text-gray-400 text-sm mt-8">
                          <LogInIcon className="h-5 w-5" />
                          Log In
                        </p>
                      </li>
                    </NavLink>
                  )}
                </ul>
              </div>
            </div>

            {/* Outlet container */}
            <div className="w-full min-h-screen">
              <Outlet />
            </div>
          </div>

          {/* Footer - Not fixed, will appear only when scrolled to bottom */}
          <motion.div>
            <motion.div
              className="footer sm:footer-horizontal bg-neutral-900 text-neutral-content p-10 mt-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1, transition: { duration: 0.5 } }}
            >
              <nav>
                <h6 className="footer-title">Services</h6>
                <a className="link link-hover">Branding</a>
                <a className="link link-hover">Design</a>
                <a className="link link-hover">Marketing</a>
                <a className="link link-hover">Advertisement</a>
              </nav>
              <nav>
                <h6 className="footer-title">Company</h6>
                <a className="link link-hover">About us</a>
                <a className="link link-hover">Contact</a>
                <a className="link link-hover">Jobs</a>
                <a className="link link-hover">Press kit</a>
              </nav>
              <nav>
                <h6 className="footer-title">Legal</h6>
                <a className="link link-hover">Terms of use</a>
                <a className="link link-hover">Privacy policy</a>
                <a className="link link-hover">Cookie policy</a>
              </nav>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default LayoutPage;
