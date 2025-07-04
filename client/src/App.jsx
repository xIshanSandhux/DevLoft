import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Room from './Room'
import Home from './home/Home'
import EnterRoom from './enterRoom/EnterRoom'

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generate-room" element={<Room />} />
        <Route path="/enter-room/:roomId" element={<EnterRoom />} />
      </Routes>
    </Router>
  );
}

export default App