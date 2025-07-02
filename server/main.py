# to start the venv environment run the following command: venv\Scripts\activate
# the stop the venve environment run the following command: deactivate

import uvicorn
import socketio

sio = socketio.AsyncServer(cors_allowed_origins="*")
app = socketio.ASGIApp(sio)
# server url: http://127.0.0.1:8000


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
