import cookieParser from "cookie-parser";
import { Server } from "socket.io";

import { verifyUser } from "../middlewares/authenticate.mjs";
import { env } from "./env.mjs";

let io;

const employeeRoom = (userId) => `employee:${userId}`;

export const attachNotificationSocket = (httpServer) => {
  io = new Server(httpServer, {
    transports: ["websocket"],

    allowRequest: (req, callback) => {
      const allowedOrigin = new URL(env.FRONTEND_ORIGIN).origin;
      callback(null, req.headers.origin === allowedOrigin);
    },
  });

  io.engine.use(cookieParser());
  io.engine.use(verifyUser);

  io.use((socket, next) => {
    const user = socket.request.user;

    if (!user || user.role !== "EMPLOYEE") {
      return next(new Error("Employee access required."));
    }

    return next();
  });

  io.on("connection", async (socket) => {
    const userId = socket.request.user.id;

    await socket.join(employeeRoom(userId));
    socket.emit("notifications:ready");
  });
};

export const notifyEmployeeInboxChanged = (employeeId) => {
  if (io) {
    io.to(employeeRoom(employeeId)).emit("notifications:changed");
  }
};