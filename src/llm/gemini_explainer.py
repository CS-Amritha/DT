import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-pro-latest")

def explain_pod_prediction(data: dict) -> str:
    prompt = f"""
You are a Kubernetes expert helping to analyze pod health predictions based on resource metrics and alert signals.

A pod was predicted as **'{data['predicted_label']}'** with the following metrics:

**CPU**
- Usage: {data['cpu_usage']}, Limit: {data['cpu_limit']}, Request: {data['cpu_request']}

**Memory**
- Usage: {data['memory_usage']}, Limit: {data['memory_limit']}, RSS: {data['memory_rss']}

**Network**
- Receive Bytes: {data['network_receive_bytes']}, Transmit Bytes: {data['network_transmit_bytes']}, Errors: {data['network_errors']}

**Other**
- Restarts: {data['restarts']}, OOMKilled: {data['oom_killed']}, Pod Ready: {data['pod_ready']}

**Disk IO**
- Read Bytes: {data['disk_read_bytes']}, Write Bytes: {data['disk_write_bytes']}, Errors: {data['disk_io_errors']}

**Uptime**
- {data['pod_uptime_seconds']} seconds

**Alerts**
- CPU Throttling: {data['CPU_Throttling']}
- High CPU Usage: {data['High_CPU_Usage']}
- OOMKilled: {data['OOMKilled_Out_of_Memory']}
- CrashLoopBackOff: {data['CrashLoopBackOff']}
- ContainerNotReady: {data['ContainerNotReady']}
- NodePressure: {data['NodePressure']}

**Prediction Probabilities**
- Good: {data['prob_good']}
- Bad: {data['prob_bad']}
- Alert: {data['prob_alert']}

**Task:**
1. Explain why this pod was predicted as **'{data['predicted_label']}'**.
2. If the prediction is **'bad'** or **'alert'**, provide specific suggestions to improve pod stability or fix the underlying issues.

Use clear reasoning and align explanations with the relevant metrics and alert signals.
"""
    response = model.generate_content(prompt)
    return response.text

def explain_node_prediction(data: dict) -> str:
    prompt = f"""
You are a Kubernetes expert analyzing **node health predictions** using resource usage, pressure conditions, and alert signals.

The node **'{data.get('node_name', 'N/A')}'** was predicted as **'{data['predicted_label']}'** with the following metrics:

**CPU**
- Usage: {data['node_cpu_usage']}, Usage %: {data['node_cpu_usage_percent']}, Load 1m Ratio: {data['nonde_cpu_load_1m_ratio']}
- Capacity: {data['node_cpu_capacity']}, Allocatable: {data['node_cpu_allocatable']}, Utilization Ratio: {data['node_cpu_utilization_ratio']}

**Memory**
- Usage: {data['node_memory_usage']}, Available %: {data['node_memory_available_percent']}, Swap %: {data['node_swap_usage_percent']}
- Capacity: {data['node_memory_capacity']}, Allocatable: {data['node_memory_allocatable']}, Utilization Ratio: {data['node_memory_utilization_ratio']}

**Disk**
- Usage: {data['node_disk_usage']}, Utilization Ratio: {data['node_disk_utilization_ratio']}, IO Time %: {data['node_disk_io_time_percent']}

**Network**
- Receive Bytes: {data['node_network_receive_bytes']}, Transmit Bytes: {data['node_network_transmit_bytes']}, Errors: {data['node_network_errors']}

**Node Conditions**
- Ready: {data['node_ready']}, Memory Pressure: {data['node_memory_pressure']}, Disk Pressure: {data['node_disk_pressure']}, PID Pressure: {data['node_pid_pressure']}, Unschedulable: {data['node_unschedulable']}

**Uptime**
- Age: {data['node_age_seconds']} seconds
- Time Since Start: {data['time_since_node_start']} seconds

**Prediction Probabilities**
- Good: {data['prob_good']}
- Bad: {data['prob_bad']}
- Alert: {data['prob_alert']}

**Task:**
1. Explain why this node was predicted as **'{data['predicted_label']}'**.
2. If the prediction is **'bad'** or **'alert'**, provide guidance to improve the node's condition or resolve potential issues.

Use detailed reasoning aligned with node metrics and conditions.
"""
    response = model.generate_content(prompt)
    return response.text
