from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class InputData(BaseModel):
    cpu_usage: float
    memory_usage: float
    # add other relevant fields used by your model

@router.post("/")
def predict(data: InputData):
    return {"message": "hi"}
