// src/admin/adminAuthProvider.js
const API_BASE_URL =
  import.meta.env.VITE_API_URL ;

const adminAuthProvider = {
  login: async ({ username, password }) => {
    const res = await fetch(`${API_BASE_URL}/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: username, password }),
    });

    if (!res.ok) throw new Error("Admin login failed");

    const data = await res.json();
    if (!data.token || !data.user) throw new Error("Invalid login response");

    // Save admin token + user
    localStorage.setItem("adminToken", data.token);
    localStorage.setItem("adminUser", JSON.stringify(data.user));

    return Promise.resolve();
  },

  logout: () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
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
      localStorage.removeItem("adminUser");
      return Promise.reject();
    }
    return Promise.resolve();
  },

  getPermissions: () => Promise.resolve(),
};

export default adminAuthProvider;
