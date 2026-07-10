import axios from "axios";
import { getAuth } from "firebase/auth";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 10000,
});

// Intercept all outgoing requests to append the user's Auth Token dynamically
API.interceptors.request.use(
  async (config) => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      // Fetch the latest JWT token from Firebase
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;