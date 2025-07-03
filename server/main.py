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
def connect(sid, environ):
    print(f"connected: {sid}")

@sio.event
def disconnect(sid):
    print(f"disconnected: {sid}")
    rooms = sio.rooms(sid)
    for room in rooms:
        sio.leave_room(sid, room)
    print(f"left all rooms: {rooms}")

@sio.event
def joinRoom(sid, data):
    roomId = data["roomId"]
    sio.enter_room(sid, roomId)
    print(f"joined room: {roomId}")
    sio.emit('userJoined', {
        'username': sid,
        'roomId': roomId
    }, room=roomId, skip_sid=sid)


app = sio_app