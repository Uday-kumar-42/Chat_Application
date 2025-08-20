const { WebSocketServer } = require("ws");

const wss = new WebSocketServer({ port: 8080 });
console.log("WebSocket server is running on port 8080");

const connections = {}; // Stores active rooms and their connections

wss.on("connection", function (socket) {
  socket.on("message", function (e) {
    let parsedMsg;
    try {
      parsedMsg = JSON.parse(e);
    } catch (error) {
      console.error("Invalid JSON received:", e);
      return;
    }

    if (!parsedMsg || !parsedMsg.type || !parsedMsg.payLoad) {
      console.error("Invalid message format:", parsedMsg);
      return;
    }

    const { type, payLoad } = parsedMsg;
    console.log(type, payLoad); 

    // Handle 'create' room message
    if (type === "create") {
      if (!payLoad.roomId || !payLoad.username || !payLoad.maxUsers) {
        console.error("Missing required fields in 'create' message:", payLoad);
        return;
      }

      // Initialize room data
      connections[payLoad.roomId] = {
        host: payLoad.username,
        roomName: payLoad.roomName,
        userCount: 1, // Initial user count is 1 (the host)
        maxUsers: payLoad.maxUsers,
        allSockets: [{ username: payLoad.username, socket }], // Store all active sockets in the room
        createdAt: new Date().toLocaleString(),
      };

      // Get unique members for the room
      const members = connections[payLoad.roomId].allSockets.map(
        (ele) => ele.username
      );
 
      // Send room info back to the host
      socket.send(
        JSON.stringify({
          type: "room-info",
          payLoad: {
            roomId: payLoad.roomId,
            roomName: payLoad.roomName,
            host: connections[payLoad.roomId].host,
            userCount: connections[payLoad.roomId].userCount,
            members,
            maxUsers: connections[payLoad.roomId].maxUsers,
            createdAt: connections[payLoad.roomId].createdAt,
          },
        })
      );
    }

    // Handle 'join' room message
    if (type === "join") {
      if (!payLoad.roomId || !payLoad.username) {
        console.error("Missing required fields in 'join' message:", payLoad);
        return;
      }

      // Check if room exists
      if (!connections[payLoad.roomId]) {
        socket.send(
          JSON.stringify({
            type: "error",
            payLoad: { errorMessage: "Room not found" },
          })
        );
        return;
      }

      // Check if room is full
      if (
        connections[payLoad.roomId].userCount >=
        connections[payLoad.roomId].maxUsers
      ) {
        socket.send(
          JSON.stringify({
            type: "error",
            payLoad: { errorMessage: "Room is full" },
          })
        );
        return;
      }

      const roomSockets = connections[payLoad.roomId].allSockets;
      const currentUniqueMembers = new Set(roomSockets.map(s => s.username));
      let userExistsInRoom = currentUniqueMembers.has(payLoad.username);

      // Add the new socket connection for the user
      // If the user is already in the room (e.g., joining from another tab), just add the new socket.
      // If it's a new unique user, update userCount and notify others.
      roomSockets.push({ username: payLoad.username, socket });

      const newUniqueMembers = new Set(roomSockets.map(s => s.username));
      const previousUserCount = connections[payLoad.roomId].userCount;
      connections[payLoad.roomId].userCount = newUniqueMembers.size;

      if (!userExistsInRoom) { // If this is a truly new unique user joining the room
        // Notify all existing sockets in the room about the new user
        roomSockets.forEach((ele) => {
          ele.socket.send(
            JSON.stringify({
              type: "new-user-joined",
              payLoad: {
                roomId: payLoad.roomId,
                newMember: payLoad.username,
                userCount: connections[payLoad.roomId].userCount,
                members: Array.from(newUniqueMembers) // Send updated unique members list
              },
            })
          );
        });
      }

      // Send room info to the joining socket
      socket.send(
        JSON.stringify({
          type: "room-info",
          payLoad: {
            roomId: payLoad.roomId,
            roomName: connections[payLoad.roomId].roomName,
            host: connections[payLoad.roomId].host,
            members: Array.from(newUniqueMembers), // Send current unique members
            userCount: connections[payLoad.roomId].userCount,
            maxUsers: connections[payLoad.roomId].maxUsers,
            createdAt: connections[payLoad.roomId].createdAt,
          },
        })
      );
    }

    // Handle 'msg' (chat message)
    if (type === "msg") {
      if (!payLoad.roomId || !payLoad.username || !payLoad.text) {
        console.error("Missing required fields in 'msg' message:", payLoad);
        return;
      }

      if (!connections[payLoad.roomId]) {
        console.error("Message sent to non-existing room:", payLoad.roomId);
        return;
      }

      const currentTime = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      const msgObj = {
        type: "msg",
        payLoad: {
          username: payLoad.username,
          text: payLoad.text,
          timestamp: currentTime,
        },
      };

      // Send message to all other sockets in the room
      connections[payLoad.roomId].allSockets.forEach((ele) => {
        if (ele.socket !== socket) { // Send to all except the sender's specific socket
          ele.socket.send(JSON.stringify(msgObj));
        }
      });
    }

    // Handle 'request-room-info' (for YourRooms page)
    if (type == "request-room-info") {
      if (!payLoad.username) {
        console.error(
          "Missing required fields in 'request-room-info' message:",
          payLoad
        );
        return;
      }

      const roomIds = Object.keys(connections);
      const filteredRoomInfo = roomIds.filter((roomId) =>
        connections[roomId].allSockets.some(
          (ele) => ele.username === payLoad.username
        )
      ).map((roomId) => ({
        roomId,
        roomName: connections[roomId].roomName,
        host: connections[roomId].host,
        members: Array.from(new Set(connections[roomId].allSockets.map(s => s.username))), // Ensure unique members
        userCount: connections[roomId].userCount,
        maxUsers: connections[roomId].maxUsers,
        createdAt: connections[roomId].createdAt,
      }));

      socket.send(
        JSON.stringify({
          type: "request-room-info",
          payLoad: filteredRoomInfo,
        })
      );
    }

    // Handle 'leave-room' message
    if (type == "leave-room") {
      if (!payLoad.roomId || !payLoad.username) {
        console.error("Missing required fields in 'leave-room' message:", payLoad);
        return;
      }

      const username = payLoad.username;
      const roomId = payLoad.roomId;

      if (!connections[roomId]) {
        console.error(`Room ${roomId} does not exist.`);
        // Even if room doesn't exist, send a confirmation to the client so they can clean up their state.
        socket.send(
          JSON.stringify({
            type: "room-data-updated",
            payLoad: { roomId, message: "Room not found, you are considered left." },
          })
        );
        return;
      }

      // Find the index of the specific socket that sent the leave message
      const socketIndex = connections[roomId].allSockets.findIndex(
        (socketObj) => socketObj.username === username && socketObj.socket === socket
      );

      if (socketIndex !== -1) {
        connections[roomId].allSockets.splice(socketIndex, 1); // Remove only this specific socket

        // Get current unique members after removing this specific socket
        const currentUniqueMembers = new Set(
          connections[roomId].allSockets.map(s => s.username)
        );
        const previousUserCount = connections[roomId].userCount;

        connections[roomId].userCount = currentUniqueMembers.size; // Update userCount based on unique members

        // If the unique user count has decreased, it means this user has truly left the room (no other tabs)
        if (connections[roomId].userCount < previousUserCount) {
          // Notify other members that this user has left
          connections[roomId].allSockets.forEach((ele) => {
            ele.socket.send(
              JSON.stringify({
                type: "user-left", // New event type for other clients
                payLoad: {
                  roomId: roomId,
                  username: username, // The username that left
                  userCount: connections[roomId].userCount,
                  members: Array.from(currentUniqueMembers) // Send updated member list
                },
              })
            );
          });
        }

        // If no more sockets (and thus no more unique users) are in the room, delete the room
        if (connections[roomId].allSockets.length === 0) {
          delete connections[roomId];
          console.log(`Room ${roomId} has been deleted as all users left`);
        }
      }

      // Always send confirmation to the leaving socket
      socket.send(
        JSON.stringify({
          type: "room-data-updated", // This type is already handled by YourRooms.jsx for deletion
          payLoad: {
            roomId,
            message: "You have successfully left the room."
          },
        })
      );
    }
  });
});
