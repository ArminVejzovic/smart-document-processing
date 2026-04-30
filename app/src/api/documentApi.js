import axios from "axios";

const API_URL = "http://localhost:5001/api/documents";

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