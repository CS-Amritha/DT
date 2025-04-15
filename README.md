 

# **Team ClusterBusters** 

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

# Demo Video  
Check out the working demo of our project here:  
[![Watch the Demo](https://img.shields.io/badge/Watch%20Demo-YouTube-red?logo=youtube)](https://your-demo-video-link.com)

# Phase II  
Phase II focuses on the extended implementation and integration of the system with real-time environments. This phase includes:
- Predicts Kubernetes pod health (Good/Bad/Alert) using ML models based on live metrics.
- Displays pod health on a live dashboard with dynamic visual updates.
- Integrates with a Large Language Model (LLM) to provide explanations and reasoning behind unhealthy pod predictions.


## Setup Instructions 
To run and manage the system in Phase II:

### 1. Clone the Repository
```bash
git clone https://github.com/CS-Amritha/DT.git
cd DT
```
### 2. Install Requirments.txt
```bash
pip install -r requirments.txt
```
### 3. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```
### 4. Running the Application
```bash
make up
```
### 5. Stop the Application
```bash
make down
```
### 6. Tear Down MongoDB Database 
```bash
make prune

```


# Phase I
Kubernetes clusters can encounter failures such as pod crashes, resource bottlenecks, and network issues. The
challenge in Phase 1 is to build an AI/ML model capable of predicting these issues before they occur by analysing
historical and real-time cluster metrics.

**Key Challenges** ⚠
- Node or pod failures
- Resource exhaustion (CPU, memory, disk)
- Network or connectivity issues
- Service disruptions based on logs and events
  
  

## Predicting Pod Failures in Kubernetes Clusters using Machine Learning

This project aims to **predict pod failures** in Kubernetes clusters by leveraging machine learning techniques. To build a meaningful and reliable dataset, we used **[LitmusChaos](https://litmuschaos.io/)** — an open-source chaos engineering tool designed to simulate various failure scenarios in cloud-native environments.

---

## Workflow Overview

### Namespace Segmentation

The Kubernetes cluster is logically divided into **namespaces** to:

- Create isolated test environments  
- Ensure clean and interference-free data collection

---

### Chaos Injection

Using **LitmusChaos**, we simulate realistic failure conditions to test pod resilience:

- Pod crashes  
- Resource exhaustion (CPU, memory)  
- Network delays and disruptions

These simulations replicate real-world stress environments, enabling our model to learn from diverse pod behaviors.

---

### Pod Classification

Each pod is categorized into one of the following classes based on its health status during chaos testing:

| Classification | Description                          |
|----------------|--------------------------------------|
| **Good**       | Stable and healthy pod               |
| **Alert**      | Under mild resource stress           |
| **Bad**        | Crashed or heavily stressed pod      |

---

### Metrics Collection & Labeling

We utilize **Prometheus** to collect **real-time pod-level metrics** during chaos tests, such as:

- CPU and memory usage  
- Network I/O  
- Pod restarts  
- Latency and availability

Each pod instance is labeled accordingly as **Good**, **Alert**, or **Bad** based on these metrics.

---

### Dataset Creation

All collected metrics, along with their labels, are exported into **structured CSV files**. This forms the core dataset used to:

- Train ML models  
- Evaluate their accuracy and performance  
- Enable predictive monitoring of pod health in real-world Kubernetes environments

---

## Outcome

The resulting machine learning models help:

- Proactively detect unstable pods  
- Alert operators about potential failures  
- Improve the reliability and observability of Kubernetes-based systems

---
## Progress Bar 

### Data Collection 
🟩🟩🟩🟩🟩🟩🟩🟩🟩⬜  90% 

### ML Model 
🟩🟩🟩🟩🟩🟩🟩🟩🟩⬜  90% 

### Live Data Tracking  
🟩🟩🟩🟩🟩🟩🟩🟩🟩⬜  90% 




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

