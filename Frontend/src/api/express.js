// src/api/express.js
import axios from "axios";

const BASE_URL = "http://localhost:8000"; // ✅ no typo

export const loginUser = async (formData) => {
  try {
    const response = await axios.post(`${BASE_URL}/user/login`, formData, {
      headers: { "Content-Type": "application/json" },
    });
    return { status: true, data: response.data };
  } catch (err) {
    console.error("Login API Error:", err.message);
    return {
      status: false,
      data: err.response?.data,
      error: err.response?.data?.detail || err.message,
    };
  }
};
