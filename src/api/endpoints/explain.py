
from fastapi import APIRouter, HTTPException
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from llm.gemini_explainer import explain_pod_prediction, explain_node_prediction
from api.schemas.shared import ExplainRequest, NodeExplainRequest  

router = APIRouter()

@router.post("/pod")
async def explain(data: ExplainRequest):
    try:
        explanation = explain_pod_prediction(data.model_dump())
        return {"explanation": explanation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/node")
async def explain_node(data: NodeExplainRequest):
    try:
        explanation = explain_node_prediction(data.model_dump())
        return {"explanation": explanation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
