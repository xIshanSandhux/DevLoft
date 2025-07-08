# to start the venv environment run the following command: venv\Scripts\activate
# the stop the venve environment run the following command: deactivate

from collections import defaultdict
import uvicorn
import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.room_gen import router
from api.livekit_api import router as livekit_api_router


fastapi_app = FastAPI()

# server url: http://127.0.0.1:8000

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://127.0.0.1:5173"],  # You can restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

fastapi_app.include_router(router, prefix="/api")
fastapi_app.include_router(livekit_api_router, prefix="/livekitTokenGen")
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
sio_app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app)  # combine both!

all_users = {}
users_in_room = defaultdict(list)
onCallinRoom = defaultdict(list)




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
        await sio.leave_room(sid, room)
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
async def UserJoined(sid, data):
    roomId = data["roomId"]
    identity = sid
    name = all_users[sid]
    await sio.emit("joinCallInfo",{
        "roomId": roomId,
        "name": name,
        "identity": identity
    }, room=roomId)
    print(f"joined voice call: {roomId} {name} {identity}")
    onCallinRoom[roomId].append(name)
    print(f"onCallinRoom: {onCallinRoom}")

@sio.event
async def UserLeft(sid, data):
    roomId = data["roomId"]
    name = data["name"]
    onCallinRoom[roomId].remove(name)
    await sio.emit("userLeftCall", {
        "roomId": roomId,
        "name": name,
        "message": f"{name} left the call"
    }, room=roomId)



app = sio_app