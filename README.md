```markdown
# 🗨️ Chat Application (Frontend + Backend)

A real-time chat application built with **Node.js**, **WebSocket (ws)**, and **MongoDB** authentication. This application supports creating chat rooms, joining rooms, sending messages, managing members, and leaving rooms, all in real-time.

---

### Features

* **User Authentication:** Secure user authentication using a username and password stored in MongoDB.
* **Real-time Messaging:** Instant communication using WebSockets for a seamless chat experience.
* **Create Chat Rooms:** Users can create new chat rooms with a specified name, host, and maximum user limit.
* **Join Existing Rooms:** Users can join available rooms, with unique usernames handled across multiple tabs.
* **Broadcast Messages:** Send messages to all members within a room.
* **User Join/Leave Notifications:** Get instant notifications when a user joins or leaves a room.
* **Track Your Rooms:** Users can track the rooms they are a member of via a `request-room-info` message.
* **Auto Room Cleanup:** Rooms are automatically deleted when the last user leaves.

---

### Tech Stack

* **Backend:** Node.js, WebSocket (ws)
* **Database:** MongoDB (for authentication)
* **Authentication:** Username + password stored in MongoDB
* **Frontend:** React (optional, not included in this snippet)

---

### Project Structure

```

/chat-app
├── server.js               \# WebSocket server (room & messaging logic)
├── auth/                   \# Authentication logic (MongoDB)
│   ├── models/             \# User schema
│   └── routes/             \# Login & signup endpoints
├── client/                 \# React frontend (optional, if included)
├── package.json
└── README.md

````

---

### Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/](https://github.com/)[your-username]/[your-repo-name].git
    cd [your-repo-name]
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up environment variables:**
    Create a `.env` file in the root directory and add the following:
    ```
    MONGO_URI=mongodb://localhost:27017/chat-app
    PORT=8080
    JWT_SECRET=your-secret-key
    ```
4.  **Start the WebSocket server:**
    ```bash
    node server.js
    ```
5.  **(Optional) Run the frontend:**
    If you have a React frontend in the `client/` directory:
    ```bash
    cd client
    npm install
    npm start
    ```

---

### WebSocket Message Types

Here’s how the server expects messages from the client:

* **Create Room**
    ```json
    {
      "type": "create",
      "payLoad": {
        "roomId": "123",
        "roomName": "My Room",
        "username": "Alice",
        "maxUsers": 5
      }
    }
    ```
* **Join Room**
    ```json
    {
      "type": "join",
      "payLoad": {
        "roomId": "123",
        "username": "Bob"
      }
    }
    ```
* **Send Message**
    ```json
    {
      "type": "msg",
      "payLoad": {
        "roomId": "123",
        "username": "Alice",
        "text": "Hello everyone!"
      }
    }
    ```
* **Leave Room**
    ```json
    {
      "type": "leave-room",
      "payLoad": {
        "roomId": "123",
        "username": "Alice"
      }
    }
    ```
* **Request My Rooms**
    ```json
    {
      "type": "request-room-info",
      "payLoad": {
        "username": "Alice"
      }
    }
    ```

---

### Authentication Flow

1.  A user signs up or logs in via the MongoDB backend.
2.  On successful login, a JSON Web Token (JWT) is issued.
3.  The frontend uses this token to establish a connection with the WebSocket server.
4.  The server verifies the username against the JWT before allowing access to chat rooms, ensuring secure communication.

---

### Auto Cleanup

* When a user leaves a room (or closes their browser), their WebSocket connection is automatically terminated and removed.
* If a room has no users remaining, it is automatically deleted to maintain a clean and efficient server state.

---

### TODO (Future Enhancements)

* [ ] Add typing indicators.
* [ ] Store message history in MongoDB.
* [ ] Add private chat (1-to-1).
* [ ] Improve UI with notifications.

---

### Author

Developed by **[Uday Kumar Pampana]**
[GitHub Profile](https://github.com/Uday-kumar-42)
````
