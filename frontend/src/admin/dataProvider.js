
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || "/api";

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const normalizeItem = (item) => ({
  ...item,
  id: item._id || item.id,
});

const dataProvider = {
  getList: async (resource) => {
    let url;

    // React Admin resource:
    // <Resource name="admins" />
    //
    // Backend endpoint:
    // GET /api/users/admins
    if (resource === "admins") {
      url = `${apiUrl}/users/admins`;
    } else {
      url = `${apiUrl}/${resource}`;
    }

    const res = await axios.get(url);

    const items = Array.isArray(res.data)
      ? res.data
      : res.data?.data || [];

    return {
      data: items.map(normalizeItem),
      total: items.length,
    };
  },

  getOne: async (resource, params) => {
    const res = await axios.get(
      `${apiUrl}/${resource}/${params.id}`
    );

    const item = res.data?.data || res.data;

    return {
      data: normalizeItem(item),
    };
  },

  create: async (resource, params) => {
    const res = await axios.post(
      `${apiUrl}/${resource}`,
      params.data
    );

    const item = res.data?.data || res.data;

    return {
      data: normalizeItem(item),
    };
  },

  update: async (resource, params) => {
    const res = await axios.put(
      `${apiUrl}/${resource}/${params.id}`,
      params.data
    );

    const item = res.data?.data || res.data;

    return {
      data: {
        ...normalizeItem(item),
        id: item?._id || item?.id || params.id,
      },
    };
  },

  delete: async (resource, params) => {
    await axios.delete(
      `${apiUrl}/${resource}/${params.id}`
    );

    return {
      data: {
        id: params.id,
      },
    };
  },
};

export default dataProvider;
