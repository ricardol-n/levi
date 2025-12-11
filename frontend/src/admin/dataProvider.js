// src/admin/dataProvider.js
import axios from "axios";

const apiUrl = "/api"; // backend base path

// Automatically attach the admin token to every request
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const dataProvider = {
  // LIST: GET /api/withdrawals
  getList: async (resource, params) => {
    const res = await axios.get(`${apiUrl}/${resource}`);

    return {
      data: res.data.map((item) => ({ ...item, id: item._id })),
      total: res.data.length,
    };
  },

  // GET ONE
  getOne: async (resource, params) => {
    const res = await axios.get(`${apiUrl}/${resource}/${params.id}`);
    return { data: { ...res.data, id: res.data._id } };
  },

  // CREATE (not used for withdrawals)
  create: async (resource, params) => {
    const res = await axios.post(`${apiUrl}/${resource}`, params.data);
    return { data: { ...res.data, id: res.data._id } };
  },

  // UPDATE (important for approve/reject)
  update: async (resource, params) => {
    const res = await axios.put(
      `${apiUrl}/${resource}/${params.id}`,
      params.data
    );

    return { data: { ...res.data.withdrawal, id: res.data.withdrawal._id } };
  },

  // DELETE
  delete: async (resource, params) => {
    await axios.delete(`${apiUrl}/${resource}/${params.id}`);
    return { data: { id: params.id } };
  }
};

export default dataProvider;
