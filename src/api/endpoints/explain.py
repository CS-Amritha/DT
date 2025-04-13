from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sys
import os

# Add the src directory to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from llm.gemini_explainer import explain_prediction

router = APIRouter()

class ExplainRequest(BaseModel):
    timestamp: str
    namespace: str
    pod: str
    node: str
    cpu_usage: float
    cpu_limit: float
    cpu_request: float
    cpu_throttling: float
    memory_usage: float
    memory_limit: float
    memory_request: float
    memory_rss: float
    network_receive_bytes: float
    network_transmit_bytes: float
    network_errors: float
    restarts: int
    oom_killed: int
    pod_ready: int
    pod_phase: int
    disk_read_bytes: float
    disk_write_bytes: float
    disk_io_errors: int
    pod_scheduled: int
    pod_pending: int
    pod_unschedulable: int
    container_running: int
    container_terminated: int
    container_waiting: int
    pod_uptime_seconds: float
    cpu_utilization_ratio: float
    memory_utilization_ratio: float
    CPU_Throttling: int
    High_CPU_Usage: int
    OOMKilled_Out_of_Memory: int
    CrashLoopBackOff: int
    ContainerNotReady: int
    PodUnschedulable: int
    NodePressure: int
    ImagePullFailure: int
    predicted_label: str
    prob_alert: float
    prob_bad: float
    prob_good: float

@router.post("/")
async def explain(data: ExplainRequest):
    try:
        explanation = explain_prediction(data.dict())
        return {"explanation": explanation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
