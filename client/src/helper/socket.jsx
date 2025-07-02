import { io } from "socket.io-client";

const socket_url = process.env.SOCKET_URL;
console.log(socket_url);

let socket = null;

export const connectSocket = () => {
    if (!socket) {
        socket = io(socket_url);
    }
    
    socket.on("connect", () => {
        console.log("connected to socket");
    });

    socket.on("disconnect", () => {
        console.log("disconnected from socket");
    });

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const joinRoom = (roomId) => {
    if (socket) {
        socket.emit("joinRoom", roomId);
    }
};
