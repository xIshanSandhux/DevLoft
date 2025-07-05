# to start the venv environment run the following command: venv\Scripts\activate
# the stop the venve environment run the following command: deactivate

import uvicorn
import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.room_gen import router


fastapi_app = FastAPI()

# server url: http://127.0.0.1:8000

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

fastapi_app.include_router(router, prefix="/api")

sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
sio_app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app)  # combine both!





@sio.event
async def connect(sid, environ):
    print(f"connected: {sid}")
    

@sio.event
async def disconnect(sid):
    print(f"disconnected: {sid}")
    rooms = sio.rooms(sid)
    for room in rooms:
        sio.leave_room(sid, room)
    print(f"left all rooms: {rooms}")

@sio.event
async def joinRoom(sid, data):
    roomId = data["roomId"]
    name = data["name"]

    await sio.enter_room(sid, roomId)


    print(f"joined room: {roomId}")
    await sio.emit('userJoined', {
        'username': sid,
        'roomId': roomId
    }, room=roomId, skip_sid=sid)

    await sio.emit("roomMessage", {
    "roomId": roomId,
    "message": f" {sid} joined the room"
    }, room=roomId)

@sio.event
async def leaveRoom(sid,data):
    room_Id = data["roomId"]
    name = data["name"]
    await sio.leave_room(sid, room_Id)
    await sio.emit("userLeftRoom", {
        "roomId": room_Id,
        "name": name,
        "message": f"{name} left the room"
    }, room=room_Id)
    print(f"{name} left the room")



app = sio_app