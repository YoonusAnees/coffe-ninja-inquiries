import cookieParser from "cookie-parser";
import { Server } from "socket.io";

import { verifyUser } from "../middlewares/authenticate.mjs";
import { env } from "./env.mjs";

let io;

const employeeRoom = (userId) => `employee:${userId}`;
const customerRoom = (userId) => `customer:${userId}`;

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

        if (!user || !["CUSTOMER", "EMPLOYEE"].includes(user.role)) {
            return next(new Error("A customer or employee account is required."));
        }

        return next();
    });

    io.on("connection", async (socket) => {
        const user = socket.request.user;

        const room = user.role === "CUSTOMER"
            ? customerRoom(user.id)
            : employeeRoom(user.id);
        await socket.join(room)
        socket.emit("notifications:ready");
    });
};

export const notifyEmployeeInboxChanged = (employeeId) => {
    if (io) {
        io.to(employeeRoom(employeeId)).emit("notifications:changed");
    }
};

export const notifyEmployeeOfCustomerReply = (employeeId) => {
    if (io) {
        io.to(employeeRoom(employeeId)).emit("customer-reply:created");
    }
};

export const notifyCustomerOfEmployeeReply = (customerId) => {
    if (io) {
        io.to(customerRoom(customerId)).emit("employee-reply:created");
    }
};