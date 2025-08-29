import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./useAuth";

export const useSocket = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (user) {
      // Connect to the socket server, explicitly providing the path
      const newSocket = io("http://localhost:3000", {
        path: "/socket.io/", // <-- Add this line
      });
      setSocket(newSocket);

      newSocket.emit("join_room", user._id);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  return socket;
};
