import axiosConfig from "../utils/axiosConfig";

export const GetDashboardReports = async () => {
  try {
    const response = await axiosConfig.get(`/dashboard/reports`);
    return response?.data;
  } catch (error) {
    console.error(error?.response?.data?.message);
  }
};