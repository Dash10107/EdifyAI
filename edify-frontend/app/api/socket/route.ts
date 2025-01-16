import { Server } from 'socket.io';

let io: Server | null = null; // To track the server instance

const SocketHandler = (req: any, res: any) => {
  if (res.socket?.server?.io) {
    console.log('Socket.IO server is already running.');
  } else {
    console.log('Initializing Socket.IO server...');
    io = new Server(res.socket.server, {
      path: '/api/socket',
      cors: {
        origin: "*", // Replace "*" with the actual client URL in production
        methods: ["GET", "POST"],
      },
    });
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log(`New client connected: ${socket.id}`);

      // Join room event
      socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room: ${roomId}`);
      });

      // Handle sending and broadcasting messages
      socket.on('send-message', (message) => {
        const { roomId, content } = message;
        io.to(roomId).emit('receive-message', {
          sender: socket.id,
          content,
        });
        console.log(`Message sent to room ${roomId}: ${content}`);
      });

      // Disconnect event
      socket.on('disconnect', () => {
        console.log(`Socket ${socket.id} disconnected.`);
      });
    });
  }

  res.end(); // End the response
};

// Next.js app directory API route handler
export const GET = (req: any, res: any) => {
  SocketHandler(req, res);
};

export const POST = (req: any, res: any) => {
  SocketHandler(req, res);
};
