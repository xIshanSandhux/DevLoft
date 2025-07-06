# to start the venv environment run the following command: venv\Scripts\activate
# the stop the venve environment run the following command: deactivate

from collections import defaultdict
import uvicorn
import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.room_gen import router


fastapi_app = FastAPI()

# server url: http://127.0.0.1:8000

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # You can restrict to your frontend domain
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

fastapi_app.include_router(router, prefix="/api")

sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
sio_app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app)  # combine both!

all_users = {}
users_in_room = defaultdict(list)




@sio.event
async def connect(sid, environ):
    print(f"connected: {sid}")
    all_users[sid] = ""
    

@sio.event
async def disconnect(sid):
    print(f"disconnected: {sid}")
    rooms = sio.rooms(sid)
    for room in rooms:
        # users_in_room[room].remove(all_users[sid])
        sio.leave_room(sid, room)
    print(f"left all rooms: {rooms}")
    del all_users[sid]

@sio.event
async def joinRoom(sid, data):
    roomId = data["roomId"]
    name = data["name"]
    all_users[sid] = name

    await sio.enter_room(sid, roomId)

    print(f"joined room: {roomId}")

    users_in_room[roomId].append(name)

    await sio.emit('userJoined', {
        'username': name,
        'roomId': roomId
    }, room=roomId)

    await sio.emit("roomMessage", {
    "roomId": roomId,
    "message": f"Welcome to the room {name} !"
    }, room=roomId)

    await sio.emit("usersInRoom", {
        "roomId": roomId,
        "users": users_in_room[roomId]
    }, room=roomId)

@sio.event
async def leaveRoom(sid,data):
    room_Id = data["roomId"]
    name = data["name"]
    await sio.leave_room(sid, room_Id)

    users_in_room[room_Id].remove(name)

    await sio.emit("userLeftRoom", {
        "roomId": room_Id,
        "name": name,
        "message": f"{name} left the room"
    }, room=room_Id)

    await sio.emit("usersInRoom", {
        "roomId": room_Id,
        "users": users_in_room[room_Id]
    }, room=room_Id)

    print(f"{name} left the room")

@sio.event
async def sendMessage(sid, data):
    roomId = data["roomId"]
    message = data["message"]
    name = data["name"]
    await sio.emit("RoomChatMessage",{
        "message": f"{name}: {message}",
    }, room=roomId)

@sio.event
async def codeChange(sid, data):
    roomId = data["roomId"]
    codeUpdate = data["codeUpdate"]
    await sio.emit("codeUpdate", {
        "roomId": roomId,
        "codeUpdate": codeUpdate
    }, room=roomId, skip_sid=sid)


@sio.event
async def cursorChange(sid, data):
    roomId = data["roomId"]
    cursorPosition = data["cursorPosition"]
    userName = data["userName"]
    await sio.emit("cursorUpdate", {
        "roomId": roomId,
        "position": cursorPosition,
        "userName": userName
    }, room=roomId, skip_sid=sid)



# ----------------Voice Call Events----------------

@sio.event
async def join_voice_call(sid, data):
    roomId = data["roomId"]
    name = data["name"]
    
    print(f"{name} joined voice call in room {roomId}")
    
    # Notify room that user joined voice call
    await sio.emit("user_joined_voice", {
        "roomId": roomId,
        "name": name,
        "user_id": sid
    }, room=roomId)

@sio.event
async def leave_voice_call(sid, data):
    roomId = data["roomId"]
    name = data["name"]
    
    print(f"{name} left voice call in room {roomId}")
    
    # Notify room that user left voice call
    await sio.emit("user_left_voice", {
        "roomId": roomId,
        "name": name,
        "user_id": sid
    }, room=roomId)

@sio.event
async def voice_call_offer(sid, data):
    roomId = data["roomId"]
    offer = data["offer"]
    caller_name = data["caller_name"]
    
    print(f"Voice call offer from {caller_name} in room {roomId}")
    
    # Send offer to all other users in the room
    await sio.emit("voice_call_offer", {
        "roomId": roomId,
        "offer": offer,
        "caller_name": caller_name,
        "caller_id": sid
    }, room=roomId, skip_sid=sid)

@sio.event
async def voice_call_answer(sid, data):
    roomId = data["roomId"]
    answer = data["answer"]
    caller_id = data["caller_id"]
    
    print(f"Voice call answer from {sid} to {caller_id}")
    
    # Send answer back to the specific caller
    await sio.emit("voice_call_answer", {
        "roomId": roomId,
        "answer": answer,
        "answerer_id": sid
    }, room=caller_id)

@sio.event
async def voice_call_ice_candidate(sid, data):
    roomId = data["roomId"]
    candidate = data["candidate"]
    target_id = data["target_id"]
    
    print(f"ICE candidate from {sid} to {target_id}")
    
    # Send ICE candidate to specific target
    await sio.emit("voice_call_ice_candidate", {
        "roomId": roomId,
        "candidate": candidate,
        "sender_id": sid
    }, room=target_id)



app = sio_app