from fastapi import APIRouter, HTTPException
import sys
import os
import traceback
from datetime import datetime
import uuid
import subprocess
from fastapi import Query

# Add the src directory to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

# Import your remediator functions and schema models
from llm.gemini_remediator import remediate_pod_prediction, remediate_node_prediction
from api.schemas.shared import ExplainRequest, NodeExplainRequest

# Import the Mongo exporter
from storage.mongo_exporter import MongoExporter

router = APIRouter()
exporter = MongoExporter()  # Initialize once

# ------------------------ POD REMEDIATE ------------------------

@router.post("/pod")
async def remediate_pod(data: ExplainRequest):
    try:
        remediation = remediate_pod_prediction(data.dict())  # Assuming this function generates the remediation command

        remediation_doc = {
            "remediation_id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat(),
            "input": data.dict(),
            "remediation": remediation,
            "status": "pending",
            "stdout": None,
            "stderr": None,
            "applied_at": None
        }

        # Save the initial remediation document
        exporter.save_to_mongo([remediation_doc], "remediations")
        return {"remediation_id": remediation_doc["remediation_id"], "remediation": remediation}

    except Exception as e:
        error_details = traceback.format_exc()
        print(f"[ERROR - /pod] {error_details}")
        raise HTTPException(status_code=500, detail=str(e))


# ------------------------ NODE REMEDIATE ------------------------

@router.post("/node")
async def remediate_node(data: NodeExplainRequest):
    try:
        print(f"Received data: {data}")

        remediation = remediate_node_prediction(data.model_dump())  # Assuming this function generates the remediation command

        remediation_doc = {
            "remediation_id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat(),
            "input": data.model_dump(),
            "remediation": remediation,
            "status": "pending",
            "stdout": None,
            "stderr": None,
            "applied_at": None
        }

        # Save the initial remediation document
        exporter.save_to_mongo([remediation_doc], "remediations")
        return {"remediation_id": remediation_doc["remediation_id"], "remediation": remediation}

    except Exception as e:
        error_details = traceback.format_exc()
        print(f"[ERROR - /node] {error_details}")
        return {"error": str(e), "traceback": error_details}


# ------------------------ APPLY REMEDIATION ------------------------

@router.post("/apply_remediation")
async def apply_remediation(remediation_id: str = Query(...)):

    try:
        # Step 1: Lookup in MongoDB
        print("[INFO] Looking up remediation in MongoDB...")
        remediation_doc = exporter.db["remediations"].find_one({"remediation_id": remediation_id})

        if not remediation_doc:
            print(f"[WARN] Remediation ID not found in MongoDB: {remediation_id}")
            raise HTTPException(status_code=404, detail="Remediation not found in DB")

        # Step 2: Extract command
        command = remediation_doc.get("remediation")
        if not command:
            print(f"[ERROR] No 'remediation' field found in the doc for ID {remediation_id}")
            raise HTTPException(status_code=400, detail="No command found in remediation")

        print(f"[INFO] Applying remediation command: {command}")

        # Step 3: Execute command
        result = subprocess.run(command, shell=True, capture_output=True, text=True)

        print(f"[INFO] Command exited with return code: {result.returncode}")
        print(f"[STDOUT]\n{result.stdout}")
        print(f"[STDERR]\n{result.stderr}", file=sys.stderr)

        # Step 4: Update MongoDB with status
        update_data = {
            "status": "success" if result.returncode == 0 else "failed",
            "stdout": result.stdout,
            "stderr": result.stderr,
            "applied_at": datetime.utcnow().isoformat()
        }

        print(f"[INFO] Updating MongoDB with status: {update_data['status']}")
        exporter.update_mongo("remediations", {"remediation_id": remediation_id}, update_data)

        return {
            "status": update_data["status"],
            "stdout": result.stdout,
            "stderr": result.stderr,
            "message": f"Remediation {remediation_id} applied"
        }

    except Exception as e:
        error_details = traceback.format_exc()
        print(f"[ERROR - /apply_remediation] {error_details}")
        raise HTTPException(status_code=500, detail=str(e))