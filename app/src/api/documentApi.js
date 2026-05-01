import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append("document", file);

  const response = await axios.post(`${API_URL}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const getDocuments = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getDocumentById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const updateDocument = async (id, data) => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
};

export const getTotalsByCurrency = async () => {
  const response = await axios.get(`${API_URL}/totals/currency`);
  return response.data;
};