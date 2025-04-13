
import axios from "axios";

const BASE_URL = "http://localhost:8000";

export type TimeRange = 
  | "last_5m" 
  | "last_10m" 
  | "last_15m" 
  | "last_30m" 
  | "last_1h" 
  | "last_3h" 
  | "last_6h" 
  | "last_1d";

export interface FetchParams {
  limit?: number;
  skip?: number;
  timeRange?: TimeRange;
}

export const api = {
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

  async explainPod(podData: any) {
    const response = await axios.post(`${BASE_URL}/explain`, podData);
    return response.data;
  },
};
