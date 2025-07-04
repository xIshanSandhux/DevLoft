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
  const [usersInRoom, setUsersInRoom] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showUsersDropdown, setShowUsersDropdown] = useState(false);

  const handleCodeChange = (value) => {
    setCode(value);
    if (socketRef.current){
      socketRef.current.emit('codeChange', {
        roomId,
        codeUpdate: value
      });
    }
  };

  const remoteCodeChange = (value) => {
    setCode(value);
  }

  const handleTotalUsers = () => {
    setShowUsersDropdown(!showUsersDropdown);
  }

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

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy!");
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

    if (socket){
    socket.on("userLeftRoom", (data) => {
      console.log("User left room:", data);
      toast.success(`${data.message}`);
    });
  }

    if (socket){
    socket.on("RoomChatMessage", (data) => {
      setMessages((prev) => [...prev, data.message]);
    });
  }

  if (socket){
    socket.on("usersInRoom", (data) => {
      if (data.roomId === roomId){
        setUsersInRoom(data.users);
        setTotalUsers(data.users.length);
      }
    });
  }

  if (socket){
    socket.on("codeUpdate", (data) => {
      if (data.roomId === roomId){
        remoteCodeChange(data.codeUpdate);
      }
    });
  }

    // Clean up the listener on component unmount
    return () => {
      if (socket) {
        socket.off("roomMessage");
        socket.off("userLeftRoom");
        socket.off("codeUpdate");
        socket.off("usersInRoom");
        socket.off("RoomChatMessage");
      }
    };
  }, [roomId, name]);

  console.log(usersInRoom);
  console.log(totalUsers);
  return (
    <div className="collab-room">
      <div className="header">
        <h1>DevLoft</h1>
        <div className="room-info">
          <button onClick={()=>copyToClipboard(`${window.location.origin}/enter-room/${roomId}`)} className="copy-button">
              Copy Inivite Link
          </button>
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
            onChange={(value) => handleCodeChange(value)}
            onMount={(editor) => {
              editorRef.current = editor;
            }}
            theme="vs-dark"
          />
        </div>

        <div className="chat-section">
        <div className="chat-header">
  <h3>Chat</h3>
  
  {/* Users Dropdown on the right side */}
  <div className="users-dropdown-container">
    <span><strong>Users in Room:</strong>  </span>
    <button 
      className="users-dropdown-trigger" 
      onClick={handleTotalUsers}
    >
      {usersInRoom.length}
    </button>
    
    {showUsersDropdown && (
      <div className="users-dropdown">
        <div className="users-dropdown-header">
          Online users:
        </div>
        <div className="users-list">
          {usersInRoom.map((user, idx) => (
            <div key={idx} className="user-item">
              <span className="user-name">{user}</span>
              {user === name && <span className="user-tag">You</span>}
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
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