import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'

function Home() {
    const navigate = useNavigate();
  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-text">DevLoft</span>
          </div>
          <div className="nav-menu">
            <a href="#features" className="nav-link">Features</a>
            <a href="#about" className="nav-link">About</a>
            <a href="#contact" className="nav-link">Contact</a>
            <button className="btn btn-primary" onClick={() => navigate('/room')}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Real-time Code Collaboration
            </h1>
            <p className="hero-subtitle">
              Code together seamlessly with your team in real-time.
            </p>
            <div className="hero-cta">
              <button className="btn btn-primary btn-large" onClick={() => navigate('/room')}>Get Started</button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h2>Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Real-time Sync</h3>
              <p>See changes as they happen with instant code synchronization.</p>
            </div>
            <div className="feature-card">
              <h3>Local Projects Import</h3>
              <p>Import your local projects or files to the platform.</p>
            </div>
            <div className="feature-card">
              <h3>Live Chat</h3>
              <p>Built-in voice and text chat for seamless communication.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <h2>About DevLoft</h2>
          <p>DevLoft is a real-time code collaboration platform designed for software engineers.</p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="container">
          <h2>Contact Us</h2>
          <p>Get in touch to learn more about DevLoft.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 DevLoft. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Home
