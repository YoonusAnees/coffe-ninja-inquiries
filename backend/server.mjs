import app from "./app.mjs";
import { createServer } from "node:http";
import { attachNotificationSocket } from "./config/notificationSocket.mjs";
const PORT = process.env.PORT || 8000;

const httpServer = createServer(app);

attachNotificationSocket(httpServer);

httpServer.listen(PORT, () => {
    console.log(`Server is Running On Port ${PORT}`)
});

