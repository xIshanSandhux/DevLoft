import { useParams } from 'react-router-dom';
import { connectSocket, joinRoom } from '../helper/socket';
import { useEffect, useState } from 'react';

function CollabRoom() {
  const { roomId } = useParams();
  const name = localStorage.getItem("name") || "Anonymous";
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const socket = connectSocket();

    // Make sure the user joins the room (idempotent)
    if (!socket.connected) {
      socket.on('connect', () => {
        joinRoom(roomId, name);
      });
    } else {
      joinRoom(roomId, name);
    }

    // Attach the listener
    socket.on("roomMessage", (data) => {
      setMessages((prev) => [...prev, data.message]);
    });

    // Clean up the listener
    return () => {
      socket.off("roomMessage");
      socket.off("connect");
    };
  }, [roomId, name]);

  return (
    <div>
      <h1>Collaborative Room</h1>
      <h2>Room ID: {roomId}</h2>
      <h2>Name: {name}</h2>

      <h3> Messages:</h3>
      <ul>
        {messages.map((msg, idx) => (
          <li key={idx}>{msg}</li>
        ))}
      </ul>

      <p>If you see this page, you’ve entered the room successfully.</p>
    </div>
  );
}

export default CollabRoom;
