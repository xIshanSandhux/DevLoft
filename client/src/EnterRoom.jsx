import React, { useState } from 'react';
import axios from 'axios';
import './Room.css';

function EnterRoom({roomId}) {
  // const [name, setName] = useState('');
  // const [password, setPassword] = useState('');
  // const [roomCreated, setRoomCreated] = useState(false);
  // const [roomId, setRoomId] = useState('');
  // const [showPassword, setShowPassword] = useState(false);

  const API_URL = 'http://127.0.0.1:8000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("roomId", roomId);
    console.log("password", password);
  };

  return (
    <div className="room-create-container">
      <div className="room-create-card">
        <h2 className="room-create-title">Enter Room</h2>
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
              placeholder="Enter Room Password"

              required
            />
            <button type="submit" className="btn btn-primary btn-large room-generate-btn">
              Enter Room
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