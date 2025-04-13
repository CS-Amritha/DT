from fastapi import APIRouter, Query
from pymongo import MongoClient
import sys
from pathlib import Path

# Adds /Users/amrithashyam/Desktop/guidewire/DT/ to sys.path
sys.path.append(str(Path(__file__).resolve().parents[2]))

from config import settings
from datetime import timedelta
import pandas as pd

router = APIRouter()

client = MongoClient(settings.MONGO_URI)
db = client[settings.MONGO_DB_NAME]

pod_collection = db["pod_metrics"]
node_collection = db["node_metrics"]
deployment_collection = db["deployment_metrics"]

# Utility: Build time filter
def build_time_filter(time_range: str, start_time: str = None, end_time: str = None):
    now = pd.Timestamp.utcnow()

    windows = {
        "last_5m": now - timedelta(minutes=5),
        "last_10m": now - timedelta(minutes=10),
        "last_15m": now - timedelta(minutes=15),
        "last_30m": now - timedelta(minutes=30),
        "last_1h": now - timedelta(hours=1),
        "last_3h": now - timedelta(hours=3),
        "last_6h": now - timedelta(hours=6),
        "last_1d": now - timedelta(days=1),
    }

    if time_range in windows:
        return {"timestamp": {"$gte": windows[time_range].isoformat()}}
    elif time_range == "custom" and start_time and end_time:
        return {
            "timestamp": {
                "$gte": pd.to_datetime(start_time).isoformat(),
                "$lte": pd.to_datetime(end_time).isoformat()
            }
        }
    else:
        return {}

# --- POD Metrics ---
@router.get("/pods")
def get_pod_metrics(
    time_range: str = Query("last_5m"),
    start_time: str = Query(None),
    end_time: str = Query(None),
    namespace: str = Query(None),
    pod_name: str = Query(None),
    limit: int = Query(100, gt=0),
    skip: int = Query(0, ge=0)
):
    query = build_time_filter(time_range, start_time, end_time)
    if namespace:
        query["namespace"] = namespace
    if pod_name:
        query["pod"] = pod_name

    total = pod_collection.count_documents(query)
    data = list(
        pod_collection.find(query, {"_id": 0})
        .sort("timestamp", -1)
        .skip(skip)
        .limit(limit)
    )
    return {
        "status": "success",
        "total": total,
        "count": len(data),
        "limit": limit,
        "skip": skip,
        "data": data
    }

# --- NODE Metrics ---
@router.get("/nodes")
def get_node_metrics(
    time_range: str = Query("last_5m"),
    start_time: str = Query(None),
    end_time: str = Query(None),
    node_name: str = Query(None),
    limit: int = Query(100, gt=0),
    skip: int = Query(0, ge=0)
):
    query = build_time_filter(time_range, start_time, end_time)
    if node_name:
        query["node_name"] = node_name

    total = node_collection.count_documents(query)
    data = list(
        node_collection.find(query, {"_id": 0})
        .sort("timestamp", -1)
        .skip(skip)
        .limit(limit)
    )
    return {
        "status": "success",
        "total": total,
        "count": len(data),
        "limit": limit,
        "skip": skip,
        "data": data
    }

# --- DEPLOYMENT Metrics ---
@router.get("/deployments")
def get_deployment_metrics(
    time_range: str = Query("last_5m"),
    start_time: str = Query(None),
    end_time: str = Query(None),
    namespace: str = Query(None),
    deployment_name: str = Query(None),
    limit: int = Query(100, gt=0),
    skip: int = Query(0, ge=0)
):
    query = build_time_filter(time_range, start_time, end_time)
    if namespace:
        query["namespace"] = namespace
    if deployment_name:
        query["deployment"] = deployment_name

    total = deployment_collection.count_documents(query)
    data = list(
        deployment_collection.find(query, {"_id": 0})
        .sort("timestamp", -1)
        .skip(skip)
        .limit(limit)
    )
    return {
        "status": "success",
        "total": total,
        "count": len(data),
        "limit": limit,
        "skip": skip,
        "data": data
    }
