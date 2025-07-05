import { io } from "socket.io-client";

const socket_url = import.meta.env.VITE_SOCKET_URL;
console.log(socket_url);

let socket = null;
let listenersAdded = false;

export const connectSocket = () => {
    if (!socket) {
        socket = io(socket_url);
    }
    
    // Only add listeners once
    if (!listenersAdded) {
        socket.on("connect", () => {
            console.log("connected to socket");
        });

        socket.on("disconnect", () => {
            console.log("disconnected from socket");
        });
        
        listenersAdded = true;
    }

    return socket;
};

export const getSocket = () => {
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        listenersAdded = false;
    }
};

export const joinRoom = (roomId, name) => {
    if (socket) {
        socket.emit("joinRoom", {roomId, name});
    }
};
