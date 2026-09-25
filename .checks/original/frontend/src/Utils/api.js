import axios from "axios";

const api = axios.create({
    baseURL: "/api",
    headers: { "Content-Type": "application/json" },
});

// Attach auth token from localStorage on every request
api.interceptors.request.use((config) => {
    const user = localStorage.getItem("coderwanda_user");
    if (user) {
        const token = btoa(user); // base64-encode the stored user JSON
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
