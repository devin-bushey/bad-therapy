from pydantic import BaseModel

class Message(BaseModel):
    content: str
    isFromUser: bool

    class Config:
        fields = {
            "isFromUser": "is_from_user"
        } 