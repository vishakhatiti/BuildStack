import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  VITE_API_UR: "https://buildstack-kmdz.onrender.com",
});

export default API;