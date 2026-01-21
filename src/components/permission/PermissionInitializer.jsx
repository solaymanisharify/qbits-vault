// src/components/PermissionInitializer.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserPermissions } from "../../store/authSlice";

const PermissionInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const { token, permissions, loading, isHydrated } = useSelector((state) => state.auth);
  const [isReady, setIsReady] = useState(false);


  useEffect(() => {
    const initializePermissions = async () => {
      // If we have a token but no permissions, fetch them
      if (token && permissions.length === 0 && !loading) {
        console.log("🔄 No permissions found - fetching from API...");
        try {
          await dispatch(fetchUserPermissions()).unwrap();
          console.log("✅ Permissions loaded successfully");
        } catch (error) {
          console.error("❌ Failed to load permissions:", error);
        }
      } else if (token && permissions.length > 0) {
        console.log("✅ Permissions already loaded:", permissions);
      }

      setIsReady(true);
    };

    initializePermissions();
  }, [token]);

  if (token && !isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading permissions...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PermissionInitializer;
