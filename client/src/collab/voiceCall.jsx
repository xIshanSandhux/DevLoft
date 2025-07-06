import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

const VoiceCall = ({socket, roomId, userName}) => {
    const [inCall, setInCall] = useState(false);
    const [muted, setMuted] = useState(false);
    const [usersInVoiceCall, setUsersInVoiceCall] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    
    const localStreamRef = useRef(null);
    const peersRef = useRef({});
    const audioRefs = useRef({});

    useEffect(() => {
        if (socket){
            socket.on('voice_call_offer', handleReceiveOffer);
            socket.on('voice_call_answer', handleReceiveAnswer);
            socket.on('voice_call_ice_candidate', handleReceiveICECandidate);
            socket.on('user_joined_voice', handleUserJoinedVoice);
            socket.on('user_left_voice', handleUserLeftVoice);
        }

        return () => {
            if (socket) {
                socket.off('voice_call_offer');
                socket.off('voice_call_answer');
                socket.off('voice_call_ice_candidate');
                socket.off('user_joined_voice');
                socket.off('user_left_voice');
            }
            
            // Close all peer connections
            Object.values(peersRef.current).forEach(peer => {
                if (peer) {
                    peer.close();
                }
            });
            
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [socket]);

    // Get user media
    const getUserMedia = async () => {
        try{
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 44100,
                    channelCount: 1,
                },
                video: false,
            });
            localStreamRef.current = stream;
            return stream;
        } catch (error){
            console.error('Error accessing microphone:', error);
            toast.error('Failed to access microphone. Please check your browser permissions.');
            throw error;
        }
    };

    const joinVoiceCall = async () => {
        try{
            setConnectionStatus('connecting');
            const stream = await getUserMedia();
            socket.emit('join_voice_call', {
                roomId,
                name: userName,
            });
            setInCall(true);
            setConnectionStatus('connected');   
        }catch (error){
            setConnectionStatus('disconnected');
            toast.error('Failed to join voice call. Please try again.');
        }
    };

    // Create peer connection using native WebRTC
    const createPeer = async (targetUserId, stream) => {
        console.log('Creating peer connection to:', targetUserId);
        
        const peer = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        });

        // Add our stream to the peer connection
        stream.getTracks().forEach(track => {
            peer.addTrack(track, stream);
        });

        // Handle incoming stream
        peer.ontrack = (event) => {
            console.log('Received remote stream from:', targetUserId);
            addAudioStream(targetUserId, event.streams[0]);
        };

        // Handle ICE candidates
        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('voice_call_ice_candidate', {
                    roomId,
                    candidate: event.candidate,
                    target_id: targetUserId
                });
            }
        };

        // Create offer
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        // Send offer through Socket.IO
        socket.emit('voice_call_offer', {
            roomId,
            offer: offer,
            caller_name: userName,
            target_id: targetUserId
        });

        peersRef.current[targetUserId] = peer;
        return peer;
    };

    // Create answering peer
    const createAnsweringPeer = async (callerId, offer, stream) => {
        console.log('Creating answering peer for:', callerId);
        
        const peer = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        });

        // Add our stream
        stream.getTracks().forEach(track => {
            peer.addTrack(track, stream);
        });

        // Handle incoming stream
        peer.ontrack = (event) => {
            console.log('Received remote stream from caller:', callerId);
            addAudioStream(callerId, event.streams[0]);
        };

        // Handle ICE candidates
        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('voice_call_ice_candidate', {
                    roomId,
                    candidate: event.candidate,
                    target_id: callerId
                });
            }
        };

        // Set remote description and create answer
        await peer.setRemoteDescription(offer);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        // Send answer through Socket.IO
        socket.emit('voice_call_answer', {
            roomId,
            answer: answer,
            caller_id: callerId
        });

        peersRef.current[callerId] = peer;
        return peer;
    };

    // Handle receiving offer
    const handleReceiveOffer = async (data) => {
        if (data.roomId !== roomId) return;
        
        try {
            if (!localStreamRef.current) {
                await getUserMedia();
                setInCall(true);
                setConnectionStatus('connected');
            }
            
            await createAnsweringPeer(data.caller_id, data.offer, localStreamRef.current);
            
        } catch (error) {
            console.error('Error handling offer:', error);
            toast.error('Failed to connect to caller');
        }
    };

    // Handle receiving answer
    const handleReceiveAnswer = async (data) => {
        if (data.roomId !== roomId) return;
        
        const peer = peersRef.current[data.answerer_id];
        if (peer) {
            try {
                await peer.setRemoteDescription(data.answer);
            } catch (error) {
                console.error('Error setting remote description:', error);
            }
        }
    };

    // Handle ICE candidates
    const handleReceiveICECandidate = async (data) => {
        if (data.roomId !== roomId) return;
        
        const peer = peersRef.current[data.sender_id];
        if (peer) {
            try {
                await peer.addIceCandidate(data.candidate);
            } catch (error) {
                console.error('Error adding ICE candidate:', error);
            }
        }
    };

    // Handle user joined
    const handleUserJoinedVoice = (data) => {
        if (data.roomId !== roomId) return;
        if (data.user_id === socket.id) return;
        
        setUsersInVoiceCall(prev => {
            const exists = prev.find(user => user.id === data.user_id);
            if (!exists) {
                return [...prev, { id: data.user_id, name: data.name, muted: false }];
            }
            return prev;
        });

        if (inCall && localStreamRef.current) {
            createPeer(data.user_id, localStreamRef.current);
        }
    };

    // Handle user left
    const handleUserLeftVoice = (data) => {
        if (data.roomId !== roomId) return;
        
        setUsersInVoiceCall(prev => prev.filter(user => user.id !== data.user_id));

        if (peersRef.current[data.user_id]) {
            peersRef.current[data.user_id].close();
            delete peersRef.current[data.user_id];
        }

        removeAudioStream(data.user_id);
    };

    // Add audio stream
    const addAudioStream = (userId, stream) => {
        console.log('Adding audio stream for user:', userId);
        console.log('Stream tracks:', stream.getTracks());
        
        if (!audioRefs.current[userId]) {
            const audio = document.createElement('audio');
            audio.srcObject = stream;
            audio.autoplay = true;
            audio.playsInline = true;
            audio.volume = 1.0;
            
            // Add debug events
            audio.onloadedmetadata = () => console.log('Audio metadata loaded for:', userId);
            audio.oncanplay = () => console.log('Audio can play for:', userId);
            audio.onerror = (e) => console.error('Audio error for:', userId, e);
            
            audio.style.display = 'none';
            document.body.appendChild(audio);
            
            console.log('Audio element created and added to DOM for:', userId);
            
            audioRefs.current[userId] = audio;
        }
    };

    // Remove audio stream
    const removeAudioStream = (userId) => {
        if (audioRefs.current[userId]) {
            audioRefs.current[userId].remove();
            delete audioRefs.current[userId];
        }
    };

    // Leave voice call
    const leaveVoiceCall = () => {
        socket.emit('leave_voice_call', {
            roomId,
            name: userName
        });

        Object.values(peersRef.current).forEach(peer => {
            if (peer) {
                peer.close();
            }
        });
        peersRef.current = {};

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }

        Object.values(audioRefs.current).forEach(audio => {
            if (audio) {
                audio.remove();
            }
        });
        audioRefs.current = {};

        setInCall(false);
        setUsersInVoiceCall([]);
        setConnectionStatus('disconnected');
        toast.success('Left voice call');
    };

    // Toggle mute
    const toggleMute = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setMuted(!audioTrack.enabled);
                
                toast.success(audioTrack.enabled ? 'Microphone unmuted' : 'Microphone muted');
            }
        }
    };

    return (
        <div className="voice-call-controls">
            <div className="voice-status">
                 <span className={`status-indicator ${connectionStatus}`}>
                     {connectionStatus === 'connecting' && '🔄'}
                     {connectionStatus === 'connected' && '🟢'}
                     {connectionStatus === 'disconnected' && '🔴'}
                 </span>
                 <span className="status-text">
                     {connectionStatus === 'connecting' && 'Connecting...'}
                     {connectionStatus === 'connected' && 'Audio Connected'}
                     {connectionStatus === 'disconnected' && 'Audio Not Connected'}
                 </span>

                 {!inCall ? (
                 <button 
                     onClick={joinVoiceCall} 
                     className="join-voice-btn"
                    disabled={!socket || connectionStatus === 'connecting'}
                >
                    Join Voice Call
                </button>
            ) : (
                <div className="voice-controls">
                    <button 
                        onClick={toggleMute} 
                        className={`mute-btn ${muted ? 'muted' : 'unmuted'}`}
                        title={muted ? 'Unmute' : 'Mute'}
                    >
                        {muted ? '🔇' : '🎤'}
                    </button>
                    <button onClick={leaveVoiceCall} className="leave-voice-btn">
                        Leave Call
                    </button>
                </div>
            )}
             </div>
             
            {usersInVoiceCall.length > 0 && (
                <div className="voice-users">
                    <div className="voice-users-header">In Voice Call ({usersInVoiceCall.length}):</div>
                    <div className="voice-users-list">
                        {usersInVoiceCall.map(user => (
                            <span key={user.id} className="voice-user">
                                {user.name} {user.muted ? '🔇' : '🎤'}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoiceCall;

