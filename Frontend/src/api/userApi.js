// src/api/userApi.js
import axios from "axios";

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(
      "http://localhost:8000/uesr/register", // keeping your original URL
      userData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data; // return the response data
  } catch (error) {
    console.error(
      "Registration failed:",
      error.response?.data || error.message
    );
    throw error; // throw the error so JSX can catch it
  }
};
