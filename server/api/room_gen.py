import hashlib
import json
import uuid
from fastapi import FastAPI, HTTPException, APIRouter
from pydantic import BaseModel

router = APIRouter()

all_rooms = {}

class RoomCreate(BaseModel):
    room_password:str

# creating a roomid and hashing the password
@router.post("/room_id_gen")
def room_id_gen(room: RoomCreate):

    try:
        # creating a room_id
        roomid = str(uuid.uuid4())[:8]
        # checking if the room_id is already in the all_rooms 
        while roomid in all_rooms:
                roomid = str(uuid.uuid4())[:8]
        # hashing the password
        pwd_hashed = hashlib.sha256(room.room_password.encode()).hexdigest()
        # adding the room_id and the hashed password to the all_rooms
        all_rooms[roomid] = pwd_hashed
        # returning the room_id
        return {"room_id": roomid}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
