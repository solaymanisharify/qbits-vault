import axios from "../utils/axiosConfig";

export const GetCashIn = async () => {
  try {
    const response = await axios.get(`/cash-in`);
    return response?.data;
  } catch (error) {
    console.error(error?.response?.data?.message);
  }
};
export const CreateCashIn = async (data) => {
  try {
    const response = await axios.post(`/cash-in`, data);
    return response?.data;
  } catch (error) {
    console.error(error?.response?.data?.message);
  }
};
