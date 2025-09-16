// api/userApi.js
import axios from "axios";

export const registerUser = async (userData) => {
  try {
    const response = await axios.post("http://localhost:8000/uesr/register", userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Registration failed:", error.response?.data || error.message);
    throw error;
  }
};
