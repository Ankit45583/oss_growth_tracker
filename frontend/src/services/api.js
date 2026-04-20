import axios from "axios";

const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: BASE,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token
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

// Handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !window.location.pathname.includes("/auth/success") &&
      !window.location.pathname.includes("/login") &&
      !window.location.pathname.includes("/signin")
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// AUTH SERVICES
export const authService = {
  // Register
  register: async (username, email, password) => {
    const response = await api.post("/auth/register", {
      username,
      email,
      password,
    });

    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
    }

    return response.data;
  },

  // Login
  login: async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
    }

    return response.data;
  },

  // Existing GitHub login
  loginWithGithub: () => {
    window.location.assign(`${BASE}/auth/github`);
  },

  // Logout
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },
};

// USER SERVICES
export const userService = {
  getUser: async () => {
    const response = await api.get("/api/user");
    return response.data;
  },

  refreshStats: async () => {
    const response = await api.post("/api/user/refresh");
    return response.data;
  },

  connectGithub: async () => {
  const response = await api.get("/auth/github/connect");
  return response.data;
},  
};

// REPO SERVICES
export const repoService = {
  getRepos: async () => {
    const response = await api.get("/api/repos");
    return response.data;
  },
};

// LEADERBOARD SERVICES
export const leaderboardService = {
  getLeaderboard: async () => {
    const response = await api.get("/api/leaderboard");
    return response.data;
  },
};

export default api;