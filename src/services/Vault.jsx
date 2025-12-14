import axiosConfig from "../utils/axiosConfig";

export const GetVaults = async () => {
  try {
    const response = await axiosConfig.get(`/vault`);
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
