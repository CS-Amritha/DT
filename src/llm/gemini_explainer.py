import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-pro-latest")

def explain_prediction(data: dict) -> str:
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

