import React, { useState, useEffect } from "react";
import Header from "../Header";
import Sidebar from "../Sidebar";
import axios from "axios";


export const Setting = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const API_BASE = import.meta.env.VITE_API_URL;
  const userId = localStorage.getItem("userId");

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // ✅ Fetch user info on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_BASE}/users/${userId}`);
        setUser(res.data);
        setForm({
          username: res.data.username || "",
          email: res.data.email || "",
          password: "",
        });
      } catch (err) {
        console.error("Failed to load user:", err);
      }
    };
    fetchUser();
  }, []);

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Save profile changes
  const saveChanges = async () => {
    try {
      const res = await axios.put(`${API_BASE}/users/${userId}`, form);
      setMessage("✅ Profile updated successfully!");
      setEditMode(false);
      setUser(res.data);
    } catch (err) {
      console.error("Error updating profile:", err);
      setMessage("❌ Failed to update profile.");
    }
  };

  return (
    <div className="dashboard-container">
      <Header toggleSidebar={toggleSidebar} />
      <div className="dashboard-content">
        <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <main className="main-content">
          <div className="settings-page">
            <h2>👤 Profile Settings</h2>

            {user ? (
              <div className="settings-card">
                <div className="profile-header">
                  <img
                    src={user.profilePic || "https://via.placeholder.com/100"}
                    alt="Profile"
                    className="profile-pic"
                  />
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="edit-btn"
                  >
                    {editMode ? "Cancel" : "Edit"}
                  </button>
                </div>

                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    disabled={!editMode}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    disabled={!editMode}
                    onChange={handleChange}
                  />
                </div>

                {editMode && (
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>2FA Security</label>
                  <p>
                    {user.is2FAEnabled
                      ? "✅ Enabled (You can disable in 2FA page)"
                      : "❌ Disabled (Go to 2FA page to enable)"}
                  </p>
                </div>

                {editMode && (
                  <button className="save-btn" onClick={saveChanges}>
                    Save Changes
                  </button>
                )}

                {message && <p className="message">{message}</p>}
              </div>
            ) : (
              <p>Loading profile...</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
