import axiosConfig from "../utils/axiosConfig";

export const GetVaults = async () => {
  try {
    const response = await axiosConfig.get(`/vault`);
    return response?.data;
  } catch (error) {
    console.error(error?.response?.data?.message);
  }
};
export const GetVaultBagById = async (vaultId, query = {}) => {
  try {
    const response = await axiosConfig.get(`/bag/${vaultId}${query ? `?${query}` : ""}`);
    return response?.data;
  } catch (error) {
    console.error(error?.response?.data?.message);
  }
};
export const GetBagByBagId = async (bagId) => {
  try {
    const response = await axiosConfig.get(`/bag/${bagId}`);
    return response?.data;
  } catch (error) {
    console.error(error?.response?.data?.message);
  }
};
export const CreateVault = async (data) => {
  try {
    const response = await axiosConfig.post(`/vault`, data);
    return response?.data;
  } catch (error) {
    console.error(error?.response?.data?.message);
  }
};
