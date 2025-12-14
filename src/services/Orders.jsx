import axios from "../utils/axiosConfig";

export const GetOrders = async () => {
  try {
    const response = await axios.get(`/get-all-orders`);
    return response?.data;
  } catch (error) {
    console.error(error?.response?.data?.message);
  }
};
