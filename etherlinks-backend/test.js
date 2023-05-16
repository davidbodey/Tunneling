// Import required modules
const assert = require('assert');
const ioClient = require('socket.io-client');
const http = require('http');
const socketIO = require('socket.io');
const express = require('express');
const cors = require('cors');
const expect = require('chai').expect;

// Set the URL for the socket connection
const socketURL = 'http://localhost:4002';

// Set the port number for the server
const PORT = process.env.PORT || 4002;

// Create an Express app and enable CORS
const app = express();
app.use(cors());

// Create an HTTP server and attach the Express app to it
const server = http.createServer(app);

// Create a Socket.IO server and attach it to the HTTP server
const io = socketIO(server);

// Handle socket connections
io.on('connection', (socket) => {
  console.log('User connected');

  // Handle encrypted messages
  socket.on('sendEncryptedMessage', (encryptedMessage) => {
      console.log('Received encrypted message:', encryptedMessage);
      socket.broadcast.emit('encryptedMessage', encryptedMessage);
  });

  // Handle torrent info
  socket.on('sendTorrentInfo', (torrentInfo) => {
    console.log('Received torrent info:', torrentInfo);
    socket.broadcast.emit('receiveTorrentInfo', torrentInfo);
  });

  // Handle received torrent info
  socket.on('receiveTorrentInfo', (torrentInfo) => {
    console.log('Received torrent info broadcast:', torrentInfo);
  });

  // Handle disconnections
  socket.on('disconnect', () => {
      console.log('User disconnected');
  });
});

// Define the test suite
describe('Server', function() {
  // Set the timeout for each test to 20000 milliseconds
  this.timeout(20000);

  // Define variables for the clients
  let client1, client2;

  // Start the server before running the tests
  before((done) => {
    server.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
        done();
    });
  });

  // Disconnect all clients and close the server after running the tests
  after((done) => {
    // Disconnect all Socket.IO clients
    Object.keys(io.sockets.sockets).forEach((socketId) => {
      const socket = io.sockets.sockets[socketId];
      socket.disconnect(true);
    });

    // Now close the server
    server.close(() => {
      done();
    });
  });

  // Disconnect clients after each test
  afterEach((done) => {
    if (client1) {
      client1.disconnect();
    }
    if (client2) {
      client2.disconnect();
    }
    done();
  });

  // Test that encrypted messages are broadcast to all clients
  it('should broadcast encrypted messages to all clients', (done) => {
    // Connect two clients to the server
    client1 = ioClient.connect(socketURL);
    client2 = ioClient.connect(socketURL);
    
    // Add error handling for the clients
    client1.on('connect_error', (error) => {
      console.log('Error connecting client 1:', error);
    });

    client2.on('connect_error', (error) => {
      console.log('Error connecting client 2:', error);
    });

    // When client 2 receives an encrypted message, check that it matches the expected message
    client2.on('encryptedMessage', (message) => {
      console.log('Client 2 received encrypted message:', message);
      expect(message).to.equal('test message');
      done();
    });

    // When client 1 connects, send an encrypted message
    client1.on('connect', () => {
      console.log('Client 1 connected, sending encrypted message');
      client1.emit('sendEncryptedMessage', 'test message');
    });
  });

  // Test that torrent info is broadcast to all clients
  it('should broadcast torrent info to all clients', (done) => {
    // Connect two clients to the server
    const client1 = ioClient.connect(socketURL);
    const client2 = ioClient.connect(socketURL);

    // Add error handling for the clients
    client1.on('connect_error', (error) => {
      console.log('Error connecting client 1:', error);
    });

    client2.on('connect_error', (error) => {
      console.log('Error connecting client 2:', error);
    });

    // When client 2 receives torrent info, check that it matches the expected object
    client2.on('receiveTorrentInfo', (torrentInfo) => {
      console.log('Client 2 received torrent info:', torrentInfo);
      assert.deepEqual(torrentInfo, [{ name: 'test torrent', size: 100 }]);
      client1.disconnect();
      client2.disconnect();
      done();
    });

    // When client 1 connects, send torrent info
    client1.on('connect', () => {
      console.log('Client 1 connected, sending torrent info');
      client1.emit('sendTorrentInfo', [{ name: 'test torrent', size: 100 }]);
    });
  });
});