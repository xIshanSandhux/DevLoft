import {
    RoomAudioRenderer,
    RoomContext,
} from '@livekit/components-react';
import { Room, createLocalAudioTrack } from 'livekit-client';
import '@livekit/components-styles';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getSocket } from '../helper/socket';
import './voiceCall.css';
import { toast} from 'react-hot-toast'

function VoiceCall({name}) {
    const socketRef = useRef(null);
    const [identity, setIdentity] = useState("");
    const [room, setRoom] = useState(null);
    const {roomId} = useParams();
    const [isConnected, setIsConnected] = useState(false);
    const [isMicOn, setIsMicOn] = useState(true);


    const handleMicToggle = () => {
        const newMic = !isMicOn;
        room.localParticipant.setMicrophoneEnabled(newMic);
        setIsMicOn(newMic);
    }
    

    const API_URL = 'http://127.0.0.1:8000/livekitTokenGen';
    const tokengen = async () => {
        console.log("roomId", roomId);
        console.log("identity", identity);
        console.log("name", name);

        try{
            const token_response = await axios.post(`${API_URL}/token_gen`, {
                roomId: roomId,
                name: name
            });
            console.log("token_response", token_response);
            return token_response.data;   
        } catch (error) {
            console.error("Error generating token:", error);
            throw error;
        }
    }

    const handleConnect = async () => {
        const token = await tokengen();
        console.log("token", token);
        const livekiturl = import.meta.env.VITE_LIVEKIT_URL;
        console.log("livekiturl", livekiturl);
        const newRoom = new Room();
        await newRoom.connect(livekiturl,token,{autoSubscribe: true});
        const mic = await createLocalAudioTrack();
        await newRoom.localParticipant.publishTrack(mic);
        setRoom(newRoom);
        setIsConnected(true);

        socketRef.current.emit('UserJoined', {
            roomId: roomId,
            name: name,
        });
    }

    const handleDisconnect = () => {
        if (room) {
          room.disconnect();
          setRoom(null);
          setIsConnected(false);
          socketRef.current.emit('UserLeft', {
            roomId: roomId,
            name: name,
          });
        }
      };
      

    useEffect(() => {
        const soc = getSocket();
        socketRef.current = soc;

        if(soc){
            soc.on('joinCallInfo', (data) => {
                const {roomId, name, identity} = data;
                setRoomId(roomId);
                setIdentity(identity);
            });
        }

        if(soc){
            soc.on('userLeftCall', (data) => {
                toast.success(`${data.message}`)
            });
        }

        return () => {
            if(soc){
                soc.off('joinCallInfo');
                soc.off('userLeftCall');
            }
        }
    }, [roomId]);

    return (
        <div>
          {!isConnected && (
            <button className='join-btn' onClick={handleConnect}>Join Voice Call</button>
          )}
    
          {isConnected && room && (
            <RoomContext.Provider value={room}>
              <RoomAudioRenderer /> 
              <button className='mute-btn' onClick={handleMicToggle}>{isMicOn ? "Mute" : "Unmute"}</button>
              <button className='leave-btn' onClick={handleDisconnect}>Leave Call</button>
            </RoomContext.Provider>
          )}
        </div>
      );
    };
    
export default VoiceCall;









