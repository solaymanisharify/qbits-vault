// src/hooks/usePermissions.js
import { useSelector, useDispatch } from "react-redux";
import { useToast } from "./useToast";
import { fetchUserPermissions } from "../store/authSlice";
import { useCallback } from "react";

export const usePermissions = () => {
  const dispatch = useDispatch();
  const { addToast } = useToast();

  // Always read fresh state from Redux
  const authState = useSelector((state) => state.auth);
  const { user, roles, permissions, loading, error, isHydrated } = authState;



  // These functions read fresh permissions EVERY time they are called
  const hasPermission = useCallback(
    (perm) => {
      const result = Array.isArray(permissions) && permissions.includes(perm);
      return result;
    },
    [permissions]
  );

  const hasAnyPermission = useCallback(
    (permArray) => {
      const result = Array.isArray(permArray) && permArray.some((p) => hasPermission(p));

      return result;
    },
    [permissions, hasPermission]
  );

  const hasRole = useCallback(
    (role) => {
      const result = Array.isArray(roles) && roles.includes(role);
      return result;
    },
    [roles]
  );

  const refreshPermissions = useCallback(async () => {
    try {
      await dispatch(fetchUserPermissions()).unwrap();
      addToast({ type: "success", message: "Permissions refreshed!" });
    } catch (err) {
      addToast({ type: "error", message: "Failed to refresh permissions" });
    }
  }, [dispatch, addToast]);

  return {
    user,
    roles,
    permissions,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasRole,
    refreshPermissions,
  };
};
