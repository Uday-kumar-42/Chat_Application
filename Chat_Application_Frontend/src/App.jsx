import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ChatArea from "./components/ChatArea";
import LayoutPage from "./components/Layout";
import RoomCreation from "./components/RoomCreation";
import Home from "./components/Home";
import JoinRoom from "./components/JoinRoom";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setSocket } from "./store/userSlice";
import YourRooms from "./components/YourRooms";
import AlertElement from "./components/AlertElement";
import ChatArea2 from "./components/ChatArea2";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorPage from "./components/ErrorPage";

const router = createBrowserRouter([
  {
    element: <LayoutPage />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/create/new-room",
        element: (
          <ProtectedRoute>
            <RoomCreation />
          </ProtectedRoute>
        ),
      },
      {
        path: "/join/new-room",
        element: (
          <ProtectedRoute>
            <JoinRoom />
          </ProtectedRoute>
        ),
      },
      // {
      //   path: "/chat-room/:id",
      //   element: (
      //     <ProtectedRoute>
      //       <ChatArea />
      //     </ProtectedRoute>
      //   ),
      // },
      {
        path: "/chat-room/:id",
        element: (
          <ProtectedRoute>
            <ChatArea2 />
          </ProtectedRoute>
        ),
      },
      {
        path: "/your-rooms",
        element: (
          <ProtectedRoute>
            <YourRooms />
          </ProtectedRoute>
        ),
      },
      {
        path: "/user/login",
        element: <Login />,
      },
      {
        path: "/user/signup",
        element: <Signup />,
      },
      {
        path: "*",
        element: <ErrorPage />,
      },
    ],
  },
]);

function App() {

  const dispatch = useDispatch();
  const [socketStatus, setSocketStatus] = useState({ code: null, msg: null });

  useEffect(() => {
    document.title = "Post Your Message - Stay Connected, Anytime, Anywhere!";


    const ws = new WebSocket("ws://localhost:8080");

    const handleOpen = () => {
      console.log("Connected to WebSocket server");
      dispatch(setSocket({ socket: ws }));
    };

    const handleError = (event) => {
      console.error("WebSocket error:", event);
      setTimeout(
        () =>
          setSocketStatus({
            code: 500,
            msg: "Failed to connect to the server",
          }),
        1000
      );
    };

    const handleClose = () => {
      console.log("WebSocket connection closed");
    };

    // Attach event listeners
    ws.addEventListener("open", handleOpen);
    ws.addEventListener("error", handleError);
    ws.addEventListener("close", handleClose);

    return () => {
      // Cleanup before unmounting
      ws.removeEventListener("open", handleOpen);
      ws.removeEventListener("error", handleError);
      ws.removeEventListener("close", handleClose);
      ws.close();
      dispatch(setSocket(null));
    };
  }, [dispatch]);

  return (
    <>
      <AlertElement status={socketStatus} setStatus={setSocketStatus} />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
