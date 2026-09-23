// src/admin/adminAuthProvider.js

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "/api"
).replace(/\/$/, "");

const ADMIN_ROLES = ["admin", "superadmin"];

// =====================================================
// REFRESH ACCESS TOKEN
// =====================================================

let refreshPromise = null;

const refreshAdminAccessToken = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem(
        "adminRefreshToken"
      );

      if (!refreshToken) {
        throw new Error(
          "No admin refresh token available."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/admin/auth/refresh-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refreshToken,
          }),
        }
      );

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (
        !response.ok ||
        !data?.success ||
        !data?.token
      ) {
        throw new Error(
          data?.message ||
            "Admin refresh token is invalid or expired."
        );
      }

      localStorage.setItem(
        "adminToken",
        data.token
      );

      if (data.refreshToken) {
        localStorage.setItem(
          "adminRefreshToken",
          data.refreshToken
        );
      }

      return data.token;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// =====================================================
// CLEAR ADMIN SESSION
// =====================================================

const clearAdminSession = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminRefreshToken");
  localStorage.removeItem("adminUser");
};

// =====================================================
// AUTH PROVIDER
// =====================================================

const adminAuthProvider = {
  // ===================================================
  // LOGIN
  // ===================================================

  login: async ({ username, password }) => {
    const response = await fetch(
      `${API_BASE_URL}/admin/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: username,
          password,
        }),
      }
    );

    let data = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new Error(
        data?.message || "Admin login failed"
      );
    }

    if (
      !data?.token ||
      !data?.refreshToken ||
      !data?.user
    ) {
      throw new Error(
        "Invalid admin login response"
      );
    }

    if (
      !ADMIN_ROLES.includes(data.user.role)
    ) {
      throw new Error(
        "Access denied: administrator account required"
      );
    }

    localStorage.setItem(
      "adminToken",
      data.token
    );

    localStorage.setItem(
      "adminRefreshToken",
      data.refreshToken
    );

    localStorage.setItem(
      "adminUser",
      JSON.stringify(data.user)
    );

    return Promise.resolve();
  },

  // ===================================================
  // LOGOUT
  // ===================================================

  logout: async () => {
    const refreshToken =
      localStorage.getItem(
        "adminRefreshToken"
      );

    try {
      if (refreshToken) {
        await fetch(
          `${API_BASE_URL}/admin/auth/logout`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              refreshToken,
            }),
          }
        );
      }
    } catch (error) {
      console.error(
        "Admin logout request failed:",
        error
      );
    }

    clearAdminSession();

    return Promise.resolve();
  },

  // ===================================================
  // CHECK AUTH
  // ===================================================

  checkAuth: async () => {
    const storedUser =
      localStorage.getItem("adminUser");

    const refreshToken =
      localStorage.getItem(
        "adminRefreshToken"
      );

    if (!storedUser || !refreshToken) {
      return Promise.reject();
    }

    let user;

    try {
      user = JSON.parse(storedUser);
    } catch {
      clearAdminSession();
      return Promise.reject();
    }

    if (
      !ADMIN_ROLES.includes(user?.role)
    ) {
      clearAdminSession();
      return Promise.reject();
    }

    let accessToken =
      localStorage.getItem("adminToken");

    // Access token still exists.
    if (accessToken) {
      return Promise.resolve();
    }

    // Access token is missing.
    // Try the refresh token.
    try {
      accessToken =
        await refreshAdminAccessToken();

      if (!accessToken) {
        throw new Error(
          "Unable to restore admin session."
        );
      }

      return Promise.resolve();
    } catch (error) {
      console.error(
        "❌ Admin session restore failed:",
        error
      );

      clearAdminSession();

      return Promise.reject();
    }
  },

  // ===================================================
  // HANDLE API ERRORS
  // ===================================================

  checkError: (error) => {
    const status =
      error?.status ||
      error?.response?.status;

    /*
     * A 401 means the current access token
     * is unauthorized/expired.
     *
     * Do NOT delete the refresh token.
     */

    if (status === 401) {
      localStorage.removeItem(
        "adminToken"
      );

      return Promise.reject();
    }

    /*
     * 403 means forbidden.
     *
     * Keep the admin session.
     */

    if (status === 403) {
      return Promise.resolve();
    }

    return Promise.resolve();
  },

  // ===================================================
  // PERMISSIONS
  // ===================================================

  getPermissions: async () => {
    try {
      const storedUser =
        localStorage.getItem(
          "adminUser"
        );

      if (!storedUser) {
        return null;
      }

      const user =
        JSON.parse(storedUser);

      return user.role || null;
    } catch {
      return null;
    }
  },

  // ===================================================
  // IDENTITY
  // ===================================================

  getIdentity: async () => {
    const storedUser =
      localStorage.getItem(
        "adminUser"
      );

    if (!storedUser) {
      throw new Error(
        "Admin user not found"
      );
    }

    const user =
      JSON.parse(storedUser);

    return {
      id:
        user._id ||
        user.id,

      fullName:
        user.username ||
        user.email ||
        "Administrator",

      email: user.email,
      role: user.role,
    };
  },
};

export default adminAuthProvider;