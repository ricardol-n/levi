// frontend/src/authProvider.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const authProvider = {
  login: async ({ username, password }) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) throw new Error("Login failed");

    const data = await res.json();
    if (!data.token) throw new Error("No token received");

    localStorage.setItem("adminToken", data.token);
    return Promise.resolve();
  },

  logout: () => {
    localStorage.removeItem("adminToken");
    return Promise.resolve();
  },

  checkAuth: () =>
    localStorage.getItem("adminToken")
      ? Promise.resolve()
      : Promise.reject(),

  checkError: (error) => {
    const status = error.status || error.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem("adminToken");
      return Promise.reject();
    }
    return Promise.resolve();
  },

  getPermissions: () => Promise.resolve(),
};

export default authProvider;
