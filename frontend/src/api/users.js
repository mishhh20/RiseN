import api from "./axiosInstance";

export const loginUser = (data) => api.post("/", data);
export const signupUser = (data) => api.post("/users/signup", data);