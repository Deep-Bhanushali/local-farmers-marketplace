import { createServer, IncomingMessage, ServerResponse } from "http";
import { parse } from "url";
import next from "next";
import { Server, Socket } from "socket.io";

// Define a type for the global NodeJS object to include our io instance
declare global {
  var io: Server | undefined;
}

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// Define the path for Socket.IO to use
const socketIoPath = "/socket.io/";

app.prepare().then(() => {
  const httpServer = createServer(
    (req: IncomingMessage, res: ServerResponse) => {
      const parsedUrl = parse(req.url!, true);
      const { pathname } = parsedUrl;

      // *** THIS IS THE CRITICAL FIX ***
      // If the request is for Socket.IO, we do NOT pass it to the Next.js handler.
      // Socket.IO will handle it automatically.
      if (pathname?.startsWith(socketIoPath)) {
        return;
      }

      // For all other requests, let Next.js do its thing.
      handle(req, res, parsedUrl);
    }
  );

  const io = new Server(httpServer, {
    path: socketIoPath, // Explicitly tell Socket.IO which path to use
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  // Make the io instance globally accessible
  global.io = io;

  io.on("connection", (socket: Socket) => {
    console.log("✅ A user connected with socket ID:", socket.id);

    socket.on("join_room", (userId: string) => {
      socket.join(userId);
      console.log(`Socket ${socket.id} joined room for user: ${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("🔥 A user disconnected:", socket.id);
    });
  });

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
