import React, { useEffect, useState } from "react";

import {
  Layout,
  Menu,
  AppBar,
  TitlePortal,
  useLogout,
} from "react-admin";

import "./admin.css";

/* =========================================================
   GET CURRENT ADMIN
========================================================= */

const getAdminUser = () => {
  try {
    const storedUser = localStorage.getItem("adminUser");

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Failed to read admin user:", error);
    return null;
  }
};

/* =========================================================
   SIDEBAR LOGOUT
========================================================= */

const SidebarLogout = () => {
  const logout = useLogout();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);

      // Fallback cleanup
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminRefreshToken");
      localStorage.removeItem("adminUser");

      window.location.href = "/admin/login";
    }
  };

  return (
    <button
      type="button"
      className="premium-sidebar-logout"
      onClick={handleLogout}
    >
      <span className="premium-sidebar-logout-icon">
        ↪
      </span>

      <span>Logout</span>
    </button>
  );
};

/* =========================================================
   SIDEBAR MENU
========================================================= */

const PremiumMenu = () => {
  const [user, setUser] = useState(() => getAdminUser());

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(getAdminUser());
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  const isSuperadmin =
    user?.role === "superadmin";

  return (
    <div className="premium-menu-wrapper">

      {/* ============================================
          BRAND
      ============================================ */}

      <div className="premium-brand">
        <div className="premium-logo">
          TXLA
        </div>

        <div className="premium-brand-text">
          <strong>txla</strong>
          <span>ADMIN CONSOLE</span>
        </div>
      </div>

      {/* ============================================
          PROFILE
      ============================================ */}

      <div className="premium-profile">

        <div className="premium-avatar">
          {user?.username
            ?.charAt(0)
            ?.toUpperCase() || "A"}
        </div>

        <div className="premium-profile-text">
          <strong>
            {user?.username || "Administrator"}
          </strong>

          <span>
            {isSuperadmin
              ? "Super Administrator"
              : "Administrator"}
          </span>
        </div>

        <span className="premium-online" />

      </div>

      {/* ============================================
          NAVIGATION
      ============================================ */}

      <div className="premium-section-title">
        MANAGEMENT
      </div>

      <Menu>

        <Menu.DashboardItem />

        <Menu.ResourceItem name="users" />

        <Menu.ResourceItem name="withdrawals" />

        {isSuperadmin && (
          <>
            <div className="premium-section-title premium-admin-section">
              ADMINISTRATION
            </div>

            <Menu.ResourceItem name="admins" />
          </>
        )}

      </Menu>

      {/* ============================================
          SECURITY
      ============================================ */}

      <div className="premium-security">

        <div className="premium-security-icon">
          ✓
        </div>

        <div>
          <strong>Secure Console</strong>

          <span>
            Protected administrator access
          </span>
        </div>

      </div>

      {/* ============================================
          LOGOUT
      ============================================ */}

      <div className="premium-sidebar-bottom">
        <SidebarLogout />
      </div>

    </div>
  );
};

/* =========================================================
   TOP APP BAR
========================================================= */

const PremiumAppBar = () => {
  return (
    <AppBar
      elevation={0}
      color="transparent"
      className="premium-appbar"
    >
      <TitlePortal />

      <div className="premium-appbar-right">

        <div className="premium-system-status">
          <span />
          System Online
        </div>

      </div>
    </AppBar>
  );
};

/* =========================================================
   ADMIN LAYOUT
========================================================= */

const AdminLayout = (props) => {
  return (
    <Layout
      {...props}
      appBar={PremiumAppBar}
      menu={PremiumMenu}
      sx={{
        "& .RaLayout-root": {
          width: "100%",
          minWidth: 0,
          overflowX: "hidden",
        },

        "& .RaLayout-appFrame": {
          width: "100%",
          minWidth: 0,
        },

        "& .RaLayout-contentWithSidebar": {
          width: "100%",
          minWidth: 0,
          display: "flex",
        },

        "& .RaLayout-content": {
          flex: "1 1 auto",
          width: "auto",
          minWidth: 0,
          maxWidth: "100%",
          overflowX: "hidden",
          boxSizing: "border-box",
        },

        "& .RaLayout-main": {
          flex: "1 1 auto",
          width: "auto",
          minWidth: 0,
          maxWidth: "100%",
          overflowX: "hidden",
          boxSizing: "border-box",
        },
      }}
    />
  );
};

export default AdminLayout;