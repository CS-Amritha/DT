import pandas as pd

df = pd.read_csv("bad.csv")

# Derived metrics
df["network_receive_MBps"] = df["network_receive_bytes"] / df["pod_uptime_seconds"] / (1024 * 1024)
df["network_transmit_MBps"] = df["network_transmit_bytes"] / df["pod_uptime_seconds"] / (1024 * 1024)
df["disk_read_MBps"] = df["disk_read_bytes"] / df["pod_uptime_seconds"] / (1024 * 1024)
df["disk_write_MBps"] = df["disk_write_bytes"] / df["pod_uptime_seconds"] / (1024 * 1024)

# Critical-only conditions
bad_conditions = (
    (df["cpu_utilization_ratio"] > 0.995) |
    (df["memory_utilization_ratio"] > 0.995) |
    (df["cpu_throttling"] > 0.6) |
    ((df["memory_limit"] > 0) & (df["memory_usage"] > 2 * df["memory_limit"])) |
    (df["pod_ready"] < 0.3) |
    (df["restarts"] >= 10) |
    (df["container_waiting"] > 2) |
    (df["container_terminated"] > 2) |
    (df["pod_uptime_seconds"] < 10) |
    (df["disk_read_MBps"] > 1500) |
    (df["disk_write_MBps"] > 1500) |
    (df["network_receive_MBps"] > 15) |
    (df["network_transmit_MBps"] > 15) |
    (df["network_errors"] > 100) |
    (df["disk_io_errors"] > 1) |
    (df["OOMKilled (Out of Memory)"] > 0) |
    (df["CrashLoopBackOff"] > 0) |
    (df["PodUnschedulable"] > 0) |
    (df["ImagePullFailure"] > 0) |
    (df["NodePressure"] > 0)
)

# Assign label
df["label"] = "good"
df.loc[bad_conditions, "label"] = "bad"

# Count + Export
bad_count = df[df["label"] == "bad"].shape[0]
good_count = df[df["label"] == "good"].shape[0]
print(f"Good pods: {good_count}, Bad pods: {bad_count}")

df[df["label"] == "bad"].to_csv("bad_pods_filtered.csv", index=False)
