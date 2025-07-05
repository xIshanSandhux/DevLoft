import { useParams } from 'react-router-dom';
import { getSocket } from '../helper/socket';
import { useEffect, useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import './collabRoom.css';

function CollabRoom() {
  const { roomId } = useParams();
  const name = localStorage.getItem("name") || "Anonymous";
  const [messages, setMessages] = useState([]);
  const [code, setCode] = useState('// Welcome to the collaborative code editor!\n// Start coding here...\n');
  const [newMessage, setNewMessage] = useState('');
  const editorRef = useRef(null);
  const socketRef = useRef(null);

  const handleCodeChange = (value) => {
    setCode(value);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && socketRef.current) {
      socketRef.current.emit('sendMessage', {
        roomId,
        message: newMessage,
        name
      });
      setNewMessage('');
    }
  };

  const handleLeaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit('leaveRoom', { roomId });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  useEffect(() => {
    // Get the existing socket connection (established in enterRoom)
    const socket = getSocket();
    socketRef.current = socket;

    if (socket) {
      // Listen for room messages
      socket.on("roomMessage", (data) => {
        setMessages((prev) => [...prev, data.message]);
      });
    }

    // Clean up the listener on component unmount
    return () => {
      if (socket) {
        socket.off("roomMessage");
      }
    };
  }, [roomId, name]);

  return (
    <div className="collab-room">
      <div className="header">
        <h1>DevLoft</h1>
        <div className="room-info">
          <span>User Name: {name}</span>
        </div>
      </div>

      <div className="main-content">
        <div className="editor-section">
          <Editor
            height="70vh"
            width="100%"
            defaultLanguage="python"
            value={code}
            onChange={handleCodeChange}
            onMount={(editor) => {
              editorRef.current = editor;
            }}
            theme="vs-dark"
          />
        </div>

        <div className="chat-section">
          <div className="chat-header">
            <h3>Chat</h3>
          </div>
          
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className="message">
                {msg}
              </div>
            ))}
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="message-input"
            />
            <button onClick={handleSendMessage} className="send-button">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CollabRoom;