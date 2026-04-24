import axios from "axios";

const configuredBase = import.meta.env.VITE_API_URL;

const DEFAULT_API_BASE_URL = "https://buildstack-kmdz.onrender.com/api";
const LOCAL_API_HOSTS = ["localhost", "127.0.0.1"];

const resolveApiBaseUrl = () => {
  if (!configuredBase) return DEFAULT_API_BASE_URL;

  try {
    const parsed = new URL(configuredBase);
    const isFrontendLocalhost = typeof window !== "undefined" && LOCAL_API_HOSTS.includes(window.location.hostname);
    const isConfiguredLocalhost = LOCAL_API_HOSTS.includes(parsed.hostname);

    if (!isFrontendLocalhost && isConfiguredLocalhost) {
      console.warn("VITE_API_URL points to localhost in production. Falling back to deployed API URL.");
      return DEFAULT_API_BASE_URL;
    }
  } catch (_error) {
    // If URL parsing fails, keep backward compatibility and let Axios surface the request error.
  }

  return configuredBase;
};

export const API_BASE_URL = resolveApiBaseUrl().replace(/\/$/, "");
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
