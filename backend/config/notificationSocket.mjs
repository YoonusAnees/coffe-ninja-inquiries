import cookieParser from "cookie-parser";
import { Server } from "socket.io";

import { resolveUserFromToken } from "../middlewares/authenticate.mjs";
import { allowedOrigins } from "./cors.mjs";

let io;

const employeeRoom = (userId) => `employee:${userId}`;
const customerRoom = (userId) => `customer:${userId}`;

export const attachNotificationSocket = (httpServer) => {
    io = new Server(httpServer, {
        transports: ["websocket"],

        allowRequest: (req, callback) => {
            const requestOrigin = req.headers.origin;
            callback(null, Boolean(requestOrigin && allowedOrigins.has(requestOrigin)));
        },
    });

    io.engine.use(cookieParser());

    io.use(async (socket, next) => {
        try {
            const cookieToken = socket.request.cookies?.token;
            const authToken =
                typeof socket.handshake.auth?.token === "string"
                    ? socket.handshake.auth.token
                    : null;
            const user = await resolveUserFromToken(cookieToken || authToken);

            if (!["CUSTOMER", "EMPLOYEE"].includes(user.role)) {
                return next(new Error("A customer or employee account is required."));
            }

            socket.request.user = user;
            return next();
        } catch (error) {
            return next(error);
        }
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