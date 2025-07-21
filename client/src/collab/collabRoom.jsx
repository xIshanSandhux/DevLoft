import { useParams } from 'react-router-dom';
import { getSocket } from '../helper/socket';
import { useEffect, useState, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import './collabRoom.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import VoiceCall from './voiceCall';
import { initBrowserFs, getFS, getPath, isIndexedDBSupported } from '../helper/browserfs';
import { FaFileImport } from 'react-icons/fa';
import {VscFileCode, VscFile, VscFolder } from 'react-icons/vsc';




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
  const [showFilePanel, setShowFilePanel] = useState(true);
  const [fs, setFs] = useState(null);
  const [path, setPath] = useState(null);
  const [isFSReady, setIsFSReady] = useState(false);
  const [showImportLocalFileButton, setShowImportLocalFileButton] = useState(true);
  const [files, setFiles] = useState([]);


  useEffect(() => {
    const initFS = async () => {
      try{
        console.log('Checking IndexedDB support...');
        
        if (!isIndexedDBSupported()) {
          toast.error('IndexedDB not supported in this browser');
          return;
        }

        console.log('Initializing BrowserFS with IndexedDB...');
        // Your approach: get fs directly from initialization
        const fileSystem = await initBrowserFs();
        const pathModule = getPath();
        
        setFs(fileSystem);
        setPath(pathModule);
        setIsFSReady(true);
        
        console.log('BrowserFS is ready with IndexedDB!');
  
        
      } catch (error) {
        console.error('Failed to initialize BrowserFS:', error);
        toast.error('Failed to initialize file system');
      }
    };
    
    initFS();
  }, []);


  const handleFileImport = (event) => {
    if (!fs) {
      toast.error('File system not ready');
      return;
    }

    const fileList = event.target.files;
    
    Array.from(fileList).forEach(file => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileContent = e.target.result;
        const fileName = file.name;
        const filePath = `/${fileName}`;
        
        try {
          // Write file to BrowserFS
          await new Promise((resolve, reject) => {
            fs.writeFile(filePath, fileContent, (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });
          
          // Add to files list
          const newFile = { name: fileName, path: filePath, content: fileContent };
          setFiles(prev => [...prev, newFile]);
          setShowImportLocalFileButton(false);
          
          // If this is the first file, set it as current
          if (files.length === 0) {
            setCode(fileContent);
          }
          
          toast.success(`Imported ${fileName}`);
          
        } catch (error) {
          console.error('Error importing file:', error);
          toast.error(`Failed to import ${fileName}`);
        }
      };
      reader.readAsText(file);
    });
  };


  

  // function which handles the code change and sends the code to the server
  const handleCodeChange = (value) => {
    setCode(value);
    if (socketRef.current){
      socketRef.current.emit('codeChange', {
        roomId,
        codeUpdate: value
      });
    }
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'py':
      case 'json':
      case 'md':
      case 'html':
      case 'css':
      case 'java':
        return <VscFileCode />;
      case 'txt':
      default:
        return <VscFile />;
    }
  };

  const handleFolderImport = (event) => {
    if (!fs) {
      toast.error('File system not ready');
      return;
    }
  
    const fileList = event.target.files;
    const importedFiles = [];
    let processedCount = 0;
    const totalFiles = fileList.length;
  
    // Show loading toast
    const loadingToast = toast.loading(`Importing ${totalFiles} files...`);
  
    Array.from(fileList).forEach(file => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileContent = e.target.result;
        const fileName = file.name;
        
        // Preserve folder structure by using the relative path
        const relativePath = file.webkitRelativePath || fileName;
        const filePath = `/${relativePath}`;
        
        try {
          // Create directory structure if needed
          const pathParts = relativePath.split('/');
          if (pathParts.length > 1) {
            // Remove the filename to get the directory path
            const dirPath = pathParts.slice(0, -1).join('/');
            const fullDirPath = `/${dirPath}`;
            
            // Create directory recursively
            await new Promise((resolve, reject) => {
              fs.mkdir(fullDirPath, { recursive: true }, (err) => {
                if (err && err.code !== 'EEXIST') {
                  reject(err);
                } else {
                  resolve();
                }
              });
            });
          }
  
          // Write file to BrowserFS
          await new Promise((resolve, reject) => {
            fs.writeFile(filePath, fileContent, (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });
          
          // Add to imported files list
          const newFile = { 
            name: fileName, 
            path: filePath, 
            content: fileContent,
            relativePath: relativePath 
          };
          importedFiles.push(newFile);
          
          processedCount++;
          
          // Update progress
          toast.loading(`Importing ${processedCount}/${totalFiles} files...`, { id: loadingToast });
          
          // If this is the last file, update the UI
          if (processedCount === totalFiles) {
            setFiles(prev => [...prev, ...importedFiles]);
            setShowImportLocalFileButton(false);
            
            // If this is the first import, set the first file as current
            if (files.length === 0 && importedFiles.length > 0) {
              setCode(importedFiles[0].content);
            }
            
            toast.success(`Successfully imported ${totalFiles} files from folder!`, { id: loadingToast });
          }
          
        } catch (error) {
          console.error('Error importing file:', error);
          toast.error(`Failed to import ${fileName}`);
          processedCount++;
          
          if (processedCount === totalFiles) {
            toast.dismiss(loadingToast);
          }
        }
      };
      reader.readAsText(file);
    });
  };

  const toggleFilePanel = () => {
    setShowFilePanel(prev => !prev);
  };



  // function which handles the code change from the server
  const remoteCodeChange = (value) => {
    setCode(value);
  }

  // function which handles the total users in the room
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

  // function which handles the leave room
  const handleLeaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit('leaveRoom', { roomId, name }); 
      navigate('/');
    }
  };

  // function which handles the key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // function which handles the copy to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy!");
    }
  };

  function FileTree({ nodes, onFileClick }) {
    return (
      <ul className="file-tree">
        {nodes.map(node => (
          node.type === 'folder' ? (
            <li key={node.name}>
              <span className="folder-label">{node.name}</span>
              <FileTree nodes={node.children} onFileClick={onFileClick} />
            </li>
          ) : (
            <li key={node.path} className="file-item" onClick={() => onFileClick(node)}>
              <span>{getFileIcon(node.name)}</span>
              <span className="file-name">{node.name}</span>
            </li>
          )
        ))}
      </ul>
    );
  }




  // useEffect which handles the socket connection
  useEffect(() => {
    // Get the existing socket connection (established in enterRoom)
    const socket = getSocket();
    socketRef.current = socket;

    if (socket) {
      // Listen for room messages
      socket.on("roomMessage", (data) => {
        toast.success(`${data.message}`);
        // setMessages((prev) => [...prev, data.message]);
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

  // console.log(usersInRoom);
  // console.log(totalUsers);
  return (
    <div className="collab-room">
      <div className="header">
        <h1>DevLoft</h1>
        <VoiceCall name={name}/>
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
        <div className="file-panel">
          <div className="file-panel-header">
            <h3>File Panel</h3>
            
          </div>
          <FileTree
     nodes={buildFileTree(files)}
     onFileClick={file => setCode(file.content)}
   />

        </div>
       
        {files.length===0?(
          <div className="no-files-section">
            <p>Import files from your local to start collaborating !</p>
              <label htmlFor="file-import" className="import-button">
                <input
                  id="file-import"
                  type="file"
                  multiple
                  accept=".java,.js,.jsx,.ts,.tsx,.py,.html,.css,.json,.md,.txt"
                  onChange={handleFileImport}
                  style={{ display: 'none' }}
                />
                <FaFileImport style={{ marginRight: '10px', cursor: 'pointer' }} />
                  Import Local Files
              </label>
              <label htmlFor="folder-import" className="import-button">
                <input
                  id="folder-import"
                  type="file"
                  multiple
                  webkitdirectory="true"
                  accept=".java,.js,.jsx,.ts,.tsx,.py,.html,.css,.json,.md,.txt"
                  onChange={handleFolderImport}
                  style={{ display: 'none' }}
                />
                <VscFolder style={{ marginRight: '10px', cursor: 'pointer' }} />
                  Import Local Folder
              </label>
          </div>
        ):(
          <div className="editor-section">
          <Editor
            height="100%"
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
        )}

      
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

function buildFileTree(files) {
  const root = [];

  files.forEach(file => {
    const parts = (file.relativePath || file.name).split('/');
    let current = root;

    parts.forEach((part, idx) => {
      const isFile = idx === parts.length - 1;
      let node = current.find(n => n.name === part && n.type === (isFile ? 'file' : 'folder'));

      if (!node) {
        if (isFile) {
          node = { ...file, type: 'file', name: part };
        } else {
          node = { type: 'folder', name: part, children: [] };
        }
        current.push(node);
      }

      if (!isFile) {
        current = node.children;
      }
    });
  });

  return root;
}

export default CollabRoom;