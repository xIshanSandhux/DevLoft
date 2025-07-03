import React, { useState } from 'react';
import axios from 'axios';
import './Room.css';

function Room() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [roomCreated, setRoomCreated] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const API_URL = 'http://127.0.0.1:8000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      const roomid_response = await axios.post(`${API_URL}/room_id_gen`, {
        room_password: password
      });
      setRoomId(roomid_response.data.room_id);
      console.log("roomId", roomId);
      setRoomCreated(true);
    } catch (error) {
      console.error('Error generating room:', error);
    }
  };

  return (
    <div className="room-create-container">
      <div className="room-create-card">
        <h2 className="room-create-title">Create Room</h2>
        {!roomCreated ? (
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
            <label htmlFor="password">Room Password</label>
            <input
              id="password"
              type="password"
              className="room-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Create a password"

              required
            />
            <button type="submit" className="btn btn-primary btn-large room-generate-btn">
              Generate Room
            </button>
          </form>
        ) : (
          <div className="room-success">
            <h3>Room Created!</h3>
            <p><strong>Room ID:</strong> <span className="room-id">{roomId}</span></p>
            <p>Share this Room ID and password with your collaborators.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Room; 