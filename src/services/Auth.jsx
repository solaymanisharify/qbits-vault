import axios from "../utils/axiosConfig";

export const SignIn = async (data) => {
  try {
    const response = await axios.post(`/login`, data);
    return response?.data;
  } catch (error) {
    return error?.response;
  }
};
export const Logout = async () => {
  try {
    const response = await axios.post(`/logout`);
    return response?.data;
  } catch (error) {
    console.error(error?.response?.data?.message);
    return error?.response?.data;
  }
};
