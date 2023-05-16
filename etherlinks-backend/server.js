// Import required modules
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

// Set the port number to listen on
const PORT = process.env.PORT || 4002;

// Create an Express app
const app = express();

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Create an HTTP server using the Express app
const server = http.createServer(app);

// Create a Socket.IO server using the HTTP server
const io = socketIO(server);

// Handle Socket.IO connections
io.on('connection', (socket) => {
    console.log('User connected');
    console.log('socket.id:', socket.id);

    // Handle the 'sendEncryptedMessage' event
    socket.on('sendEncryptedMessage', (encryptedMessage) => {
        console.log('Received encrypted message:', encryptedMessage);
        // Broadcast the encrypted message to all clients except the sender
        socket.broadcast.emit('encryptedMessage', encryptedMessage);
    });

    // Handle the 'sendTorrentInfo' event
    socket.on('sendTorrentInfo', (torrentInfo) => {
        console.log('Received torrent info:', torrentInfo);
        // Broadcast the torrent info to all clients except the sender
        socket.broadcast.emit('receiveTorrentInfo', torrentInfo);
    });

    // Handle disconnections
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    // Handle server close events
    server.on('close', () => {
        console.log('Server closed');
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});