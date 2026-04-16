import axios from "axios";

const configuredBase = import.meta.env.VITE_API_URL;

if (!configuredBase) {
  console.error("Missing VITE_API_URL (example: https://your-render-url.onrender.com/api)");
}

export const API_BASE_URL = configuredBase;

const API = axios.create({
  baseURL: configuredBase,
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
