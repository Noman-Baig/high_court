//

import axios from "axios";
import { baseUrl } from "./base";
import { secureGet } from "../utils/secureStorage"; // your secure storage helper

const api = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor runs BEFORE each request → safe place to read current token
api.interceptors.request.use(
  (config) => {
    // Get the latest token from secure storage (or you can use localStorage if not encrypted)
    const token = secureGet("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Handle FormData (multipart/form-data)
    if (config.data instanceof FormData) {
      // Let browser set Content-Type with boundary
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: response interceptor for handling 401, etc.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optional: logout user, redirect to login
      // logout(); // if you have a logout function
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
