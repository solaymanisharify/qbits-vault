// src/features/reconciliation/reconciliationSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { CheckReconcile } from "../services/Reconcile";

export const fetchReconciliationStatus = createAsyncThunk("reconciliation/fetchStatus", async (_, { rejectWithValue }) => {
  try {
    const response = await CheckReconcile();
    return response.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data || "Failed to fetch status");
  }
});

const reconciliationSlice = createSlice({
  name: "reconciliation",
  initialState: {
    isLocked: false,
    status: "pending",
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReconciliationStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReconciliationStatus.fulfilled, (state, action) => {
        state.loading = false;

        // Try both shapes
        const data = action.payload?.data || action.payload;

        state.isLocked = data?.is_locked === true;
        state.status = data?.status || "none";
      })
      .addCase(fetchReconciliationStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const selectIsLockedForOperations = (state) => state.reconciliation.isLocked && state.reconciliation.status === "in_progress";

export default reconciliationSlice.reducer;
