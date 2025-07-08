from fastapi import FastAPI, HTTPException, APIRouter
from pydantic import BaseModel
from livekit import api
import os
from dotenv import load_dotenv


router = APIRouter()

all_rooms = {}

load_dotenv()
API_KEY = os.getenv('LIVEKIT_API_KEY')
API_SECRET = os.getenv('LIVEKIT_API_SECRET')

if not API_KEY or not API_SECRET:
    raise ValueError("LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be set")

print(API_KEY, API_SECRET)



class TokenGen(BaseModel):
    roomId:str
    name:str

@router.post("/token_gen")
def token_gen(req:TokenGen):
    token = api.AccessToken(API_KEY, API_SECRET).with_identity(req.name).with_grants(api.VideoGrants(room_join=True, room=req.roomId))
    return token.to_jwt()
