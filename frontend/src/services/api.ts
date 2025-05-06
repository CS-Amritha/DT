import axios from "axios";

// Your FastAPI backend base URL
const BASE_URL = "http://localhost:8000";

// Define allowed time ranges for dashboard filtering
export type TimeRange = 
  | "last_5m" 
  | "last_10m" 
  | "last_15m" 
  | "last_30m" 
  | "last_1h" 
  | "last_3h" 
  | "last_6h" 
  | "last_1d";

// Define optional parameters used in paginated fetch calls
export interface FetchParams {
  limit?: number;
  skip?: number;
  timeRange?: TimeRange;
}

// Main API object
export const api = {
  /**
   * Fetch paginated Kubernetes pod data with time range filtering
   */
  async fetchPods({ limit = 10, skip = 0, timeRange = "last_5m" }: FetchParams = {}) {
    const response = await axios.get(`${BASE_URL}/dashboard/pods`, {
      params: {
        limit,
        skip,
        time_range: timeRange,
      },
    });
    return response.data;
  },

  /**
   * Fetch paginated Kubernetes node data with time range filtering
   */
  async fetchNodes({ limit = 10, skip = 0, timeRange = "last_5m" }: FetchParams = {}) {
    const response = await axios.get(`${BASE_URL}/dashboard/nodes`, {
      params: {
        limit,
        skip,
        time_range: timeRange,
      },
    });
    return response.data;
  },

  /**
   * Send pod metrics to backend for LLM explanation
   */
  async explainPod(podData: any) {
    const response = await axios.post(`${BASE_URL}/explain/pod`, podData);
    return response.data;
  },

  /**
   * Send node metrics to backend for LLM explanation
   */
  async explainNode(nodeData: any) {
    const response = await axios.post(`${BASE_URL}/explain/node`, nodeData);
    return response.data;
  },

  async remediatePod(podData: any) {
    const response = await axios.post(`${BASE_URL}/remediate/pod`, podData);
    return response.data;
  },

  async remediateNode(nodeData: any) {
    const response = await axios.post(`${BASE_URL}/remediate/node`, nodeData);
    return response.data;
  },
};
