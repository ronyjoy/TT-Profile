import axios from "axios";

const REACT_APP_API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

// Create an Axios instance with a base URL
const api = axios.create({
  baseURL: REACT_APP_API_URL, // ✅ Removed quotes around template literal
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach the token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
