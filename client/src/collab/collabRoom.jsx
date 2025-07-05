import { useParams } from 'react-router-dom';
import { getSocket } from '../helper/socket';
import { useEffect, useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import './collabRoom.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

function CollabRoom() {
  const { roomId } = useParams();
  const { name } = useLocation().state || "Anonymous";
  const [messages, setMessages] = useState([]);
  const [code, setCode] = useState('// Welcome to the collaborative code editor!\n// Start coding here...\n');
  const [newMessage, setNewMessage] = useState('');
  const editorRef = useRef(null);
  const socketRef = useRef(null);
  const navigate = useNavigate();

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
      socketRef.current.emit('leaveRoom', { roomId, name }); 
      navigate('/');
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

    socket.on("userLeftRoom", (data) => {
      console.log("User left room:", data);
      toast.success(`${data.message}`);
      if (data.name===name){
        navigate('/');
      }
    });

    // Clean up the listener on component unmount
    return () => {
      if (socket) {
        socket.off("roomMessage");
        socket.off("userLeftRoom");
      }
    };
  }, [roomId, name]);

  return (
    <div className="collab-room">
      <div className="header">
        <h1>DevLoft</h1>
        <div className="room-info">
          <span>User Name: {name}</span>
          <button onClick={handleLeaveRoom} className="leave-button">
              Leave Room
          </button>
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