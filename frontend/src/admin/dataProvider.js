// src/admin/dataProvider.js
import axios from "axios";

const apiUrl = "/api"; // base URL of your backend

const dataProvider = {
  getList: async (resource, params) => {
    const res = await axios.get(`${apiUrl}/admin/${resource}`);
    return {
      data: res.data.data.map((item) => ({ ...item, id: item._id })),
      total: res.data.data.length,
    };
  },

  getOne: async (resource, params) => {
    const res = await axios.get(`${apiUrl}/admin/${resource}/${params.id}`);
    return { data: { ...res.data.data, id: res.data.data._id } };
  },

  create: async (resource, params) => {
    const res = await axios.post(`${apiUrl}/admin/${resource}`, params.data);
    return { data: { ...res.data.data, id: res.data.data._id } };
  },

  update: async (resource, params) => {
    const res = await axios.put(`${apiUrl}/admin/${resource}/${params.id}`, params.data);
    return { data: { ...res.data.data, id: res.data.data._id } };
  },

  delete: async (resource, params) => {
    await axios.delete(`${apiUrl}/admin/${resource}/${params.id}`);
    return { data: { id: params.id } };
  },

  // ✅ Custom method for approve/reject
  customMethod: async (url, options) => {
    const res = await axios({
      url: `${apiUrl}/${url}`,
      method: options.method || "GET",
      data: options.data || {},
    });
    return res.data;
  },
};

export default dataProvider;
