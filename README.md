 

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
🟩🟩🟩🟩🟩🟩🟩⬜⬜⬜  70%   

### 📌 ML Model 
🟩🟩🟩🟩🟩🟩🟩⬜⬜⬜  70% 

### 📌 Live Data Tracking  
🟩🟩🟩🟩⬜⬜⬜⬜⬜⬜  40% 




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
   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/grafana/grafana-original.svg" alt="Grafana" width="60"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prometheus/prometheus-original.svg" alt="Prometheus" width="60"/>
  <img src="https://avatars.githubusercontent.com/u/59082378?v=4" alt="Chaos Mesh" width="60"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" alt="Python" width="60"/>
  <img src="https://upload.wikimedia.org/wikipedia/commons/4/4b/Bash_Logo_Colored.svg" alt="Shell Scripts" width="60"/>
  <img src="https://kind.sigs.k8s.io/logo/logo.png" alt="Kubernetes in Docker (kind)" width="75"/>
  <img src="https://avatars.githubusercontent.com/u/7739233?s=280&v=4" alt="Chaos Mesh" width="75"/>

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

