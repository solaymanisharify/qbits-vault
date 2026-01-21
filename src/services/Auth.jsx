import axios from "../utils/axiosConfig";

export const SignIn = async (data) => {
  try {
    const response = await axios.post(`/login`, data);

    console.log({ response });
    return response?.data;
  } catch (error) {
    console.log({ error });
    // console.log(error?.response?.data?.message);
    console.log(error?.response);
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
