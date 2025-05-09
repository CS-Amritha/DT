import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash-latest")

def remediate_pod_prediction(data: dict) -> str:
    prompt = f"""
You are a Kubernetes DevOps expert.

A pod named '{data['pod']}' in the namespace '{data['namespace']}', running on node '{data['node']}', has been classified as '{data['predicted_label']}'.

Below are the pod-level resource metrics and alert indicators:

CPU:
  - Usage: {data['cpu_usage']}, Limit: {data['cpu_limit']}, Throttling: {data['cpu_throttling']}
Memory:
  - Usage: {data['memory_usage']}, Limit: {data['memory_limit']}, RSS: {data['memory_rss']}
Network:
  - Errors: {data['network_errors']}, RX: {data['network_receive_bytes']}, TX: {data['network_transmit_bytes']}
Disk:
  - Read: {data['disk_read_bytes']}, Write: {data['disk_write_bytes']}, IO Errors: {data['disk_io_errors']}

Pod Conditions:
  - CrashLoopBackOff: {data['CrashLoopBackOff']}
  - OOMKilled: {data['OOMKilled_Out_of_Memory']}
  - High CPU: {data['High_CPU_Usage']}
  - ContainerNotReady: {data['ContainerNotReady']}
  - PodUnschedulable: {data['PodUnschedulable']}
  - NodePressure: {data['NodePressure']}

Your task is to generate a **bash script** that performs the following:

1. Analyzes the above metrics and alerts to determine the likely root cause of the issue.
2. Dynamically retrieves:
   - All container names in the pod '{data['pod']}'
   - The name of the associated Deployment (trace: Pod → ReplicaSet → Deployment)
3. Based on the diagnosis, performs an appropriate remediation **only if needed**:
   if the current container resource limits are present and retrievable using kubectl get deployment -o jsonpath, even when using container index or safe iteration then
   - patch the deployment to increase resource limits (CPU by 50%, memory by 20%). Use --type=json for patching to avoid the error.
   if cpu and memory limits are 0:
   -add the resource limits for that pod's deployement's for example:
            resources:
            requests:
              cpu: "250m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
   and do a kubectl apply -f <deployment_file.yaml>
4. Displays:
   - Any actions taken, such as updated resource limits per container
   - The current pod status
   - Any relevant verification or confirmation

**Instructions:**
- Print clear status messages after each action.
- Do not include markdown, YAML, or explanations.
- Output only the bash script.
- Assume the script will run in a bash shell with `kubectl`, `bc`, `awk`, and `sed` available.

Only output the bash script, and nothing else, definitely no markdown.
"""
    response = model.generate_content(prompt)
    return response.text.strip()

def remediate_node_prediction(data: dict) -> str:
    prompt = f"""
You are a Kubernetes DevOps engineer.

The node '{data.get('node_name', 'N/A')}' is predicted as '{data.get('predicted_label', 'unknown')}' based on the following metrics and conditions:

CPU:
- Usage %: {data.get('node_cpu_usage_percent')}
- Load 1m Ratio: {data.get('nonde_cpu_load_1m_ratio')}

Memory:
- Usage: {data.get('node_memory_usage')}
- Available %: {data.get('node_memory_available_percent')}
- Swap %: {data.get('node_swap_usage_percent')}

Disk:
- Usage: {data.get('node_disk_usage')}
- IO Time %: {data.get('node_disk_io_time_percent')}

Network:
- Errors: {data.get('node_network_errors')}

Node Conditions:
- Ready: {data.get('node_ready')}
- Memory Pressure: {data.get('node_memory_pressure')}
- Disk Pressure: {data.get('node_disk_pressure')}
- PID Pressure: {data.get('node_pid_pressure')}
- Unschedulable: {data.get('node_unschedulable')}



Analyzes the above metrics and alerts to determine the likely root cause of the issue.

Your job is to output:
- Only the required kubectl commands (no explanation) for the issue
- Include taint removal commands if node is unschedulable.
- Do not output anything other than the command that patches the node. (Do not include any other commands like decribe , list etc of nodes).
- Only one single patch command.
- Assume you're running this in a terminal with kubectl and access to the cluster.
- Do not include markdown, YAML, or explanations.
"""
    response = model.generate_content(prompt)
    return response.text.strip()