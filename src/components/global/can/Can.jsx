import { usePermissions } from "../../../hooks/usePermissions";

const Can = ({ perform, anyOf, children, fallback = null }) => {
  const { hasPermission, hasAnyPermission, loading, isHydrated } = usePermissions();

  // Show loading only if still fetching
  if (loading && !isHydrated) {
    return <div className="text-gray-400 text-sm">Loading permissions...</div>;
  }

  const allowed = anyOf ? hasAnyPermission(anyOf) : perform ? hasPermission(perform) : true;

  return allowed ? children : fallback;
};

export default Can;
