import api from "./axiosInstance";

export const loginUser = (data) => api.post("/users/login", data);
export const signupUser = (data) => api.post("/users/signup", data);