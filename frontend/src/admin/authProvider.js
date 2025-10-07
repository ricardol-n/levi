// admin/authProvider.js
const API_URL = `${import.meta.env.VITE_API_URL}/admin`;


const authProvider = {
  login: ({ username, password }) => {
    const request = new Request(`${API_URL}/login`, {
      method: "POST",
      body: JSON.stringify({ email: username, password }),
      headers: new Headers({ "Content-Type": "application/json" }),
    });

    return fetch(request)
      .then((response) => {
        if (response.status < 200 || response.status >= 300) {
          throw new Error("Invalid login");
        }
        return response.json();
      })
      .then(({ token, role }) => {
        if (role !== "admin") {
          throw new Error("Not authorized"); // block non-admins
        }
        localStorage.setItem("adminToken", token);
        localStorage.setItem("adminRole", role);
      });
  },

  logout: () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    return Promise.resolve();
  },

  checkAuth: () =>
    localStorage.getItem("adminToken") ? Promise.resolve() : Promise.reject(),

  checkError: (error) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminRole");
      return Promise.reject();
    }
    return Promise.resolve();
  },

  getPermissions: () => {
    const role = localStorage.getItem("adminRole");
    return role ? Promise.resolve(role) : Promise.reject();
  },
};

export default authProvider;
