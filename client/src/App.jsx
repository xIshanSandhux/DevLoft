import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Room from './Room'
import Home from './home/Home'
import EnterRoom from './enterRoom/EnterRoom'
import CollabRoom from './collab/collabRoom'
import Hero from './website/Hero'

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Hero />} />
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/generate-room" element={<Room />} />
        <Route path="/enter-room/:roomId" element={<EnterRoom />} />
        <Route path="/collab-room/:roomId" element={<CollabRoom />} />
      </Routes>
    </Router>
  );
}

export default App