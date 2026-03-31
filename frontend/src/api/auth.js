import api from "./axiosInstance";

export const loginUser = (data) => api.post("/users/login", data);
export const signupUser = (data) => api.post("/users/signup", data);
export const getProfile = () => api.get("/users/profile");
export const updatePassword = (data) => api.put("/users/profile/password", data);