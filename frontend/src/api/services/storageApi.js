import api from "../client"; //

export const getStorageUsage = async () => {
  const response = await api.get("/storage/usage");
  return response.data;
};
