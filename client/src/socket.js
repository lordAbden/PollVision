import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the window.location object
// Since we proxy in dev (vite) or run on same port in prod, this works usually.
// But mostly we are on port 5173 (client) and 3000 (server).
// So we must specify URL.

const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3000';

export const socket = io(URL, {
    autoConnect: true,
    withCredentials: true,
    transports: ["websocket", "polling"] // Try websocket, fallback to polling
});
