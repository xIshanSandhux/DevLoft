import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Room from './Room'
import Home from './home/Home'
import EnterRoom from './EnterRoom'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room" element={<Room />} />
        <Route path="/enterRoom/:roomId" element={<EnterRoom />} />
      </Routes>
    </Router>
  );
}

export default App