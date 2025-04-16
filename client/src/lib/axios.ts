import axios from "axios";
// import { isCookie } from "react-router-dom";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    // token: `Bearer:${isCookie("token")}`,
  },
  withCredentials: true,
});

export default api;
