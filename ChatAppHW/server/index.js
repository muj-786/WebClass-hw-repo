const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '../client')));

const MAX_HISTORY = 20;

// Data structures to track:
const users = new Map(); // socket.id -> {username, room}
const rooms = new Map(); // roomName -> {messages: [{sender, text, to}], users: Set(username)}

const DEFAULT_ROOM = 'General';

// Initialize default room
rooms.set(DEFAULT_ROOM, { messages: [], users: new Set() });

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user login with username and room choice
  socket.on('login', ({ username, room }) => {
    room = room || DEFAULT_ROOM;

    // Save user info
    users.set(socket.id, { username, room });

    // Join the socket.io room
    socket.join(room);

    // Add username to room user set
    if (!rooms.has(room)) {
      rooms.set(room, { messages: [], users: new Set() });
    }
    rooms.get(room).users.add(username);

    // Send message history for the room to this socket
    socket.emit('message history', rooms.get(room).messages);

    // Notify others in the room
    socket.to(room).emit('chat message', {
      sender: 'System',
      text: `${username} has joined the room.`,
      to: null,
    });

    // Send updated user list in room
    io.to(room).emit('room users', Array.from(rooms.get(room).users));
  });

  // Handle chat messages (to room or private)
  socket.on('chat message', ({ text, to }) => {
    const user = users.get(socket.id);
    if (!user) return; // User not logged in

    const { username, room } = user;
    const roomInfo = rooms.get(room);
    if (!roomInfo) return;

    const message = { sender: username, text, to: to || null };

    if (to && to !== 'All') {
      // Private message: find socket of recipient
      for (const [id, u] of users.entries()) {
        if (u.username === to && u.room === room) {
          io.to(id).emit('chat message', message); // Send to recipient
          socket.emit('chat message', message);    // Send to sender as well
          break;
        }
      }
    } else {
      // Broadcast to entire room
      io.to(room).emit('chat message', message);

      // Store message in room history
      roomInfo.messages.push(message);
      if (roomInfo.messages.length > MAX_HISTORY) {
        roomInfo.messages.shift();
      }
    }
  });

  // Handle room switching
  socket.on('switch room', (newRoom) => {
    const user = users.get(socket.id);
    if (!user) return;

    const oldRoom = user.room;
    const username = user.username;

    // Leave old room
    socket.leave(oldRoom);
    rooms.get(oldRoom)?.users.delete(username);
    io.to(oldRoom).emit('chat message', {
      sender: 'System',
      text: `${username} has left the room.`,
      to: null,
    });
    io.to(oldRoom).emit('room users', Array.from(rooms.get(oldRoom)?.users || []));

    // Join new room
    user.room = newRoom;
    socket.join(newRoom);

    if (!rooms.has(newRoom)) {
      rooms.set(newRoom, { messages: [], users: new Set() });
    }
    rooms.get(newRoom).users.add(username);

    // Send message history of new room
    socket.emit('message history', rooms.get(newRoom).messages);

    io.to(newRoom).emit('chat message', {
      sender: 'System',
      text: `${username} has joined the room.`,
      to: null,
    });
    io.to(newRoom).emit('room users', Array.from(rooms.get(newRoom).users));
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (!user) return;

    const { username, room } = user;
    users.delete(socket.id);

    rooms.get(room)?.users.delete(username);
    io.to(room).emit('chat message', {
      sender: 'System',
      text: `${username} has disconnected.`,
      to: null,
    });
    io.to(room).emit('room users', Array.from(rooms.get(room)?.users || []));

    console.log('User disconnected:', socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
