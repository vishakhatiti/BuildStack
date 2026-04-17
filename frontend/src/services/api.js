import axios from "axios";

const configuredBase = import.meta.env.VITE_API_URL;

if (!configuredBase) {
  throw new Error("Missing VITE_API_URL, expected deployed Render API URL ending with /api");
}

export const API_BASE_URL = configuredBase.replace(/\/$/, "");
export const AUTH_BASE_URL = API_BASE_URL.replace(/\/api$/, "");

const API = axios.create({
  baseURL: API_BASE_URL,
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
