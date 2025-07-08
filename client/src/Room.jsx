import React, { useState } from 'react';
import axios from 'axios';
import './Room.css';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function Room() {
  const [password, setPassword] = useState('');
  const [roomCreated, setRoomCreated] = useState(false);

  const API_URL = 'http://127.0.0.1:8000/api';
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      const roomid_response = await axios.post(`${API_URL}/room_id_gen`, {
        room_password: password
      });
      const new_room_id = roomid_response.data.room_id;
      setRoomCreated(true);
      if(roomCreated){
        toast.success(`Room created ${new_room_id} successfully!`);
      }
      navigate(`/enter-room/${new_room_id}`);  
    } catch (error) {
      console.error('Error generating room:', error);
    }
  };

  return (
    <div className="room-create-container">
      <div className="room-create-card">
        <h2 className="room-create-title">Create Room</h2>
          <form className="room-form" onSubmit={handleSubmit}>
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
            <button type="submit" className="room-generate-btn">
              Generate Room
            </button>
          </form>
      </div>
    </div>
  );
}

export default Room; 