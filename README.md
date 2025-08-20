# 🗨️ Chat Application (Frontend + Backend)

A real-time chat application built with Node.js, WebSocket (ws), and MongoDB authentication.
This application supports creating chat rooms, joining rooms, sending messages, managing members, and leaving rooms, all in real-time.

🚀 Features

🔑 User Authentication with MongoDB (username + password).

💬 Real-time messaging using WebSockets.

🏠 Create chat rooms with a host and max user limit.

👥 Join existing rooms (unique usernames handled across multiple tabs).

📢 Broadcast messages to all members in a room.

👋 User join/leave notifications.

🗂️ Track your rooms (via request-room-info).

🗑️ Auto room cleanup when all users leave.

🛠️ Tech Stack

Backend: Node.js, WebSocket (ws)

Database: MongoDB (for authentication)

Authentication: Username + password stored in MongoDB

Frontend: React (not included in this snippet, but works with these APIs)

📂 Project Structure
/chat-app
│── server.js         # WebSocket server (room & messaging logic)
│── auth/             # Authentication logic (MongoDB)
│   ├── models/       # User schema
│   └── routes/       # Login & signup endpoints
│── client/           # React frontend (optional, if included)
│── package.json
│── README.md

⚙️ Setup & Installation
1. Clone the repo
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

2. Install dependencies
npm install

3. Set up environment variables

Create a .env file in the root directory:

MONGO_URI=mongodb://localhost:27017/chat-app
PORT=8080
JWT_SECRET=your-secret-key

4. Start the WebSocket server
node server.js

5. (Optional) Run the frontend

If you have a React frontend in client/:

cd client
npm install
npm start

📡 WebSocket Message Types

Here’s how the server expects messages:

Create Room
{
  "type": "create",
  "payLoad": {
    "roomId": "123",
    "roomName": "My Room",
    "username": "Alice",
    "maxUsers": 5
  }
}

Join Room
{
  "type": "join",
  "payLoad": {
    "roomId": "123",
    "username": "Bob"
  }
}

Send Message
{
  "type": "msg",
  "payLoad": {
    "roomId": "123",
    "username": "Alice",
    "text": "Hello everyone!"
  }
}

Leave Room
{
  "type": "leave-room",
  "payLoad": {
    "roomId": "123",
    "username": "Alice"
  }
}

Request My Rooms
{
  "type": "request-room-info",
  "payLoad": {
    "username": "Alice"
  }
}

🔐 Authentication Flow

User signs up / logs in via MongoDB backend.

On successful login, a JWT token is issued.

The frontend uses this token to connect with the WebSocket server.

Username is verified before allowing access to chat rooms.

🧹 Auto Cleanup

If a user leaves a room (or closes the browser), their socket is removed.

If no users remain in a room, the room is deleted automatically.

📌 TODO (Future Enhancements)

✅ Add typing indicators.

✅ Store message history in MongoDB.

✅ Add private chat (1-to-1).

✅ Improve UI with notifications.

👨‍💻 Author

Developed by [Your Name]
