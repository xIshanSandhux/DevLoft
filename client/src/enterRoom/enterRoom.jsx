import React, { useState } from 'react';
import axios from 'axios';
import './enterRoom.css';
import { useParams, useNavigate } from 'react-router-dom';
import { connectSocket, joinRoom } from '../helper/socket';
import { toast } from 'react-hot-toast';

function EnterRoom() {
  const {roomId} = useParams();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();


  const API_URL = 'http://127.0.0.1:8000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("roomId", roomId);
    try{
        const enter_room_response = await axios.post(`${API_URL}/enter_room`, {
            room_id: roomId,
            room_password: password
        });
        const message = enter_room_response.data.message;
        console.log("enter_room_response", message);
        if (message === "Room entered successfully"){
            const socket = connectSocket();
            joinRoom(roomId, name);
            toast.success("Room entered successfully");
            localStorage.setItem("name", name);
            navigate(`/collab-room/${roomId}`, {state: {name}});
        } else {
            toast.error("Invalid password");
        }
    } catch (error) {
        console.error("Error entering room:", error);
    }
  };

  return (
    <div className="room-create-container">
      <div className="room-create-card">
        <h2 className="room-create-title">Enter Room</h2>
       
          <form className="room-form" onSubmit={handleSubmit}>
            <label htmlFor="name">Your Name</label>
            <input
              id="name"
              type="text"
              className="room-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
            <label htmlFor="roomId">Room ID</label>
            <input
              id="roomId"
              type="text"
              className="room-input"
              value={roomId}
              onChange={e => setRoomId(e.target.value)}
              style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
              disabled
            />
            <label htmlFor="password">Room Password</label>
            <input
              id="password"
              type="password"
              className="room-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter room password"

              required
            />
            <button type="submit" className="room-generate-btn">
              Enter Room
            </button>
          </form>
      </div>
    </div>
  );
}

export default EnterRoom; 