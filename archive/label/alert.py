import pandas as pd

df = pd.read_csv("alert.csv")

# Derived metrics
df["network_receive_MBps"] = df["network_receive_bytes"] / df["pod_uptime_seconds"] / (1024 * 1024)
df["network_transmit_MBps"] = df["network_transmit_bytes"] / df["pod_uptime_seconds"] / (1024 * 1024)
df["disk_read_MBps"] = df["disk_read_bytes"] / df["pod_uptime_seconds"] / (1024 * 1024)
df["disk_write_MBps"] = df["disk_write_bytes"] / df["pod_uptime_seconds"] / (1024 * 1024)

# Reset score
df["alert_score"] = 0

# Soft alerts with medium thresholds
df["alert_score"] += (df["cpu_utilization_ratio"] > 0.9).astype(int)
df["alert_score"] += (df["memory_utilization_ratio"] > 0.9).astype(int)
df["alert_score"] += (df["cpu_throttling"] > 0.2).astype(int)
df["alert_score"] += (df["pod_ready"] < 1.0).astype(int)
df["alert_score"] += (df["restarts"] >= 1).astype(int)
df["alert_score"] += (df["container_waiting"] >= 1).astype(int)
df["alert_score"] += (df["container_terminated"] >= 1).astype(int)
df["alert_score"] += (df["pod_uptime_seconds"] < 90).astype(int)
df["alert_score"] += (df["disk_read_MBps"] > 600).astype(int)
df["alert_score"] += (df["disk_write_MBps"] > 600).astype(int)
df["alert_score"] += (df["network_receive_MBps"] > 6).astype(int)
df["alert_score"] += (df["network_transmit_MBps"] > 6).astype(int)
df["alert_score"] += (df["network_errors"] > 0).astype(int)
df["alert_score"] += (df["disk_io_errors"] > 0).astype(int)

# Strong signals with weights
critical_flags = {
    "OOMKilled (Out of Memory)": 2,
    "CrashLoopBackOff": 2,
    "ContainerNotReady": 1,
    "PodUnschedulable": 1,
    "NodePressure": 1,
    "ImagePullFailure": 1,
}
for col, weight in critical_flags.items():
    df["alert_score"] += df[col] * weight

# Trigger alert if score >= 2 (moderate sensitivity)
df["alert"] = df["alert_score"].apply(lambda x: "alert" if x >= 2 else "normal")

# Summary
print(df["alert"].value_counts())
df[df["alert"] == "alert"].to_csv("alert_pods_filtered.csv", index=False)
