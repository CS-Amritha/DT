from fastapi import APIRouter, HTTPException
import sys
import os
import traceback

# Add the src directory to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from llm.gemini_remediator import remediate_pod_prediction, remediate_node_prediction
from api.schemas.shared import ExplainRequest, NodeExplainRequest

router = APIRouter()

# ------------------------ POD REMEDIATE ------------------------

@router.post("/pod")
async def remediate_pod(data: ExplainRequest):
    try:
        remediation = remediate_pod_prediction(data.dict())
        return {"remediation": remediation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ------------------------ NODE REMEDIATE ------------------------

@router.post("/node")
async def remediate_node(data: NodeExplainRequest):
    try:
        # Add a debugging response before the remediation process starts
        print(f"Received data: {data}")
        
        remediation = remediate_node_prediction(data.model_dump())  # assuming it's async
        return {"remediation": remediation}
    
    except Exception as e:
        # If an error occurs, print traceback for more context
        error_details = traceback.format_exc()
        print(f"Error: {error_details}")  # You can also log this instead of print
        
        # Return the detailed error in the response to help debug
        return {"error": str(e), "traceback": error_details}