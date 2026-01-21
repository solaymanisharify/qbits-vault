import axiosConfig from "../utils/axiosConfig";

export const GetReconciles = async () => {
  try {
    const response = await axiosConfig.get(`/reconciles`);
    return response?.data;
  } catch (error) {
    console.error(error?.response?.data?.message);
  }
};
export const StartReconcile = async (data) => {
  try {
    const response = await axiosConfig.post(`/reconcile`, data);
    return response?.data;
  } catch (error) {
    console.error(error?.response?.data?.message);
  }
};

export const GetPendingReconciliations = async () => {
  try {
    const response = await axiosConfig.get(`/pending/reconciles`);
    return response?.data;
  } catch (error) {
    console.error(error?.response?.data?.message);
  }
};

export const VerifyReconcile = async (id, action, note = "") => {
  try {
    const response = await axiosConfig.post(`/reconcile/verify/${id}`, { action, note });
    return response?.data;
  } catch (error) {
    console.error(error?.response?.data?.message);
  }
};

export const ApproveReconcile = async (id, note = "") => {
  try {
    const response = await axiosConfig.post(`/reconcile/approve/${id}`, { note });
    return response?.data;
  } catch (error) {
    console.error(error?.response?.data?.message);
  }
};
