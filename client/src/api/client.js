import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "/api";

const client = axios.create({ baseURL });

export const diseaseApi = {
  analyze: (file) => {
    const form = new FormData();
    form.append("image", file);
    return client.post("/disease/analyze", form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data);
  },
};

export const weatherApi = {
  outlook: (payload) => client.post("/weather/outlook", payload).then((r) => r.data),
};

export const yieldApi = {
  estimate: (payload) => client.post("/yield/estimate", payload).then((r) => r.data),
  crops: () => client.get("/yield/crops").then((r) => r.data),
};

export const fertilizerApi = {
  recommend: (payload) => client.post("/fertilizer/recommend", payload).then((r) => r.data),
};

export const storageApi = {
  thresholds: () => client.get("/storage/thresholds").then((r) => r.data),
  submitReading: (payload) => client.post("/storage/reading", payload).then((r) => r.data),
  alerts: (commodity) => client.get(`/storage/alerts/${commodity}`).then((r) => r.data),
};

export default client;
