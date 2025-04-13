 

# **Team ClusterBusters** 👩‍💻

Amrita Vishwa Vidyapeetham, Coimbatore  
B.Tech Computer Science (Cyber Security)    

<br>

```
Project Structure

├── dataset               # Contains the .csv data generated using our script
├── docs                  # Documentation.md
├── presentation          # Presentation Phase I
├── models                # Two models in .pkl format
├── src                   # Source code directory
│── test                  # Python and bash shell script to test the model
|── archive               # Past work (code, datasets, models)
|
└── README.md             # This file
```

🧠 DT - Model Testing Instructions
---
This repository contains the codebase and scripts for testing our model submission for the hackathon.


🚀 Quick Start: How to Test the Model
---
Follow these steps to clone the repository, install dependencies, and run the model on the provided test data.


🔧 Step 1: Clone the Repository
---
Clone this repository using Git and move into the project directory:

```bash
git clone https://github.com/CS-Amritha/DT.git
cd DT
```
📦 Step 2: Install Python Dependencies
---
Install all required Python packages using pip. Make sure Python 3.8+ is installed.

```bash
pip install -r requirements.txt
```
▶️ Step 3: Run the Prediction Script
---
Navigate to the test folder and run the run_predictions.sh script using the provided test CSV file.

```bash
cd test
bash run_predictions.sh ../data/test_data.csv
```

📌 Notes
---

- After prediction, an output CSV file with predicted results will be generated in the same data/ directory.
- The model’s accuracy will be printed directly in the terminal after the script runs.



Problem Statement ❓ - Phase I
---
Kubernetes clusters can encounter failures such as pod crashes, resource bottlenecks, and network issues. The
challenge in Phase 1 is to build an AI/ML model capable of predicting these issues before they occur by analysing
historical and real-time cluster metrics.

**Key Challenges** ⚠️
- Node or pod failures
- Resource exhaustion (CPU, memory, disk)
- Network or connectivity issues
- Service disruptions based on logs and events
  
---
Phase I Progress Bar 
---  
### 📌 Data Collection 
🟩🟩🟩🟩🟩🟩🟩🟩🟩⬜  90%   

Our primary focus is on predicting pod errors within Kubernetes clusters. To build a robust dataset, we employed **[LitmusChaos](https://docs.litmuschaos.io/docs/introduction/what-is-litmus)** — an open-source chaos engineering platform tailored for cloud-native environments. It enables the simulation of various failure scenarios in a controlled and systematic way, helping us study system resilience under stress.

## Workflow Overview

- **Namespace Segmentation**  
  We structured our Kubernetes cluster into multiple namespaces to isolate different testing environments, ensuring cleaner data collection and minimal cross-interference.

- **Chaos Workflows**  
  Using LitmusChaos, we designed workflows that inject specific types of faults — such as pod crashes, resource exhaustion, and network partitioning — to simulate real-world failure conditions.

- **Pod Classification**  
  Based on the behavior observed during chaos injection:
  - **Good Pods**: Stable and functioning normally.
  - **Alert Pods**: Showing early signs of resource stress or potential failure.
  - **Bad Pods**: Stressed or deliberately crashed during chaos experiments.

- **Data Labeling & Metrics Collection**  
  Using Prometheus, we monitored and gathered pod-level metrics throughout the chaos experiments. Each data instance was labeled accordingly (`Good`, `Alert`, or `Bad`).

- **Dataset Compilation**  
  All labeled metrics were compiled into structured `.csv` files and stored in our dataset directory. This dataset forms the foundation for training and validating our machine learning models focused on predictive pod failure detection.

---

### 📌 ML Model 
🟩🟩🟩🟩🟩🟩🟩🟩🟩⬜  90% 

### 📌 Live Data Tracking  
🟩🟩🟩🟩🟩🟩🟩🟩🟩⬜  90% 




Problem Statement ❓ - Phase II
---
Once issues are predicted, the next step is to automate or recommend actions for remediation. The challenge in Phase
2 is to create an agent or system capable of responding to these predicted issues by suggesting or implementing actions
to mitigate potential failures in the Kubernetes cluster.

**Key Challenges** ⚠️
- Scaling pods when resource exhaustion is predicted
- Restarting or relocating pods when failures are forecasted
- Optimizing CPU or memory allocation when bottlenecks are detected


## Tech Stack & Tools 🛠️

  <p>
  <img src="https://github.com/litmuschaos/litmus/raw/master/images/litmus-logo-dark-bg-stacked.png" alt="LitmusChaos" width="75"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/grafana/grafana-original.svg" alt="Grafana" width="60"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prometheus/prometheus-original.svg" alt="Prometheus" width="60"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" alt="Python" width="60"/>
  <img src="https://upload.wikimedia.org/wikipedia/commons/4/4b/Bash_Logo_Colored.svg" alt="Shell Scripts" width="60"/>
  <img src="https://kind.sigs.k8s.io/logo/logo.png" alt="Kubernetes in Docker (kind)" width="75"/>
  

  </p>


## Meet The Team 👥

<div align="center">
  <table>
    <tr>
      <td align="center">
        <a href="https://github.com/ADITHYA-NS">
          <img src="https://github.com/ADITHYA-NS.png" width="150" style="border-radius:10px;"><br>
          @ADITHYA-NS
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/Avi-Nair">
          <img src="https://github.com/Avi-Nair.png" width="150" style="border-radius:10px;"><br>
          @Avi-Nair
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/CS-Amritha">
          <img src="https://github.com/CS-Amritha.png" width="150" style="border-radius:10px;"><br>
          @CS_Amritha
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/Anaswara-Suresh">
          <img src="https://github.com/Anaswara-Suresh.png" width="150" style="border-radius:10px;"><br>
          @Anaswara-Suresh
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/R-Sruthi">
          <img src="https://github.com/R-Sruthi.png" width="150" style="border-radius:10px;"><br>
          @R-Sruthi
        </a>
      </td>
    </tr>
  </table>
</div>

