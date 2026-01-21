import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../../hooks/useToast";
import { Shield, Key, Plus, Trash2, Pencil, Check, ChevronDown } from "lucide-react";
import CustomModal from "../../components/global/modal/CustomModal";
import axiosConfig from "../../utils/axiosConfig";
import DataTable from "../../components/global/dataTable/DataTable";

const RolePermissionManager = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("roles");
  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [isDeleteRole, setIsDeleteRole] = useState(false);
  const [selectedRoleForDelete, setSelectedRoleForDelete] = useState(null);

  // Permissions Tab states
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);

  // Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Data states
  const [roles, setRoles] = useState([]);

  // Form states for role modal
  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const tabs = [
    { id: "roles", label: "Roles", icon: Shield },
    { id: "permissions", label: "Permissions", icon: Key },
    { id: "verifiers", label: "Verifiers", icon: Check },
  ];

  useEffect(() => {
    fetchRoles();
    fetchAllPermissions();
  }, []);

  //fetch all roles with permissions
  const fetchRoles = async () => {
    try {
      const res = await axiosConfig.get("/roles");
      setRoles(res?.data?.data || []);
    } catch (err) {
      addToast({ type: "error", message: "Failed to load roles" });
    }
  };

  const fetchAllPermissions = async () => {
    try {
      const res = await axiosConfig.get("/permissions");
      setAllPermissions(res?.data || []);
    } catch (err) {
      addToast({ type: "error", message: "Failed to load permissions" });
    }
  };

  // Handle role selection from dropdown
  const handleRoleSelect = async (role) => {
    setSelectedRoleForPermissions(role);
    setDropdownOpen(false);

    try {
      const filteredPermissions = roles.find((p) => p.id === role.id);
      setRolePermissions(filteredPermissions?.permissions?.map((p) => p.id) || []);
    } catch (err) {
      addToast({ type: "error", message: "Failed to load permissions" });
      setRolePermissions([]);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle permission
  const toggleRolePermission = async (permId) => {
    if (!selectedRoleForPermissions) return;

    const isCurrentlyAssigned = rolePermissions.includes(permId);
    const newPermissions = isCurrentlyAssigned ? rolePermissions.filter((id) => id !== permId) : [...rolePermissions, permId];

    setRolePermissions(newPermissions);

    try {
      await axiosConfig.put(`/permissions/${selectedRoleForPermissions.id}`, {
        permissions: newPermissions,
      });
      addToast({ type: "success", message: "Permissions updated!" });
    } catch (err) {
      addToast({ type: "error", message: "Failed to update" });
      setRolePermissions(rolePermissions); // revert
    }
  };

  // Role CRUD functions (unchanged)
  const openCreateModal = () => {
    setIsEditMode(false);
    setEditingRole(null);
    setRoleName("");
    setSelectedPermissions([]);
    setOpenRoleModal(true);
  };

  const openEditModal = (role) => {
    setIsEditMode(true);
    setEditingRole(role);
    setRoleName(role.name);
    setSelectedPermissions(role.permissions?.map((p) => p.id) || []);
    setOpenRoleModal(true);
  };

  const closeModal = () => {
    setOpenRoleModal(false);
    setIsEditMode(false);
    setEditingRole(null);
    setRoleName("");
    setSelectedPermissions([]);
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!roleName.trim()) {
      addToast({ type: "error", message: "Role name required" });
      return;
    }

    try {
      if (isEditMode) {
        await axiosConfig.put(`/roles/${editingRole.id}`, {
          name: roleName,
          permissions: selectedPermissions,
        });
        addToast({ type: "success", message: "Role updated!" });
      } else {
        await axiosConfig.post("/roles", {
          name: roleName,
          permissions: selectedPermissions,
        });
        addToast({ type: "success", message: "Role created!" });
      }
      closeModal();
      fetchRoles();
    } catch (err) {
      addToast({ type: "error", message: "Operation failed" });
    }
  };

  const handleDeleteRole = (role) => {
    setSelectedRoleForDelete(role);
    setIsDeleteRole(true);
  };

  const confirmDeleteRole = async () => {
    try {
      await axiosConfig.delete(`/roles/${selectedRoleForDelete.id}`);
      addToast({ type: "success", message: "Role deleted!" });
      fetchRoles();
      setIsDeleteRole(false);
      setSelectedRoleForDelete(null);
      if (selectedRoleForPermissions?.id === selectedRoleForDelete.id) {
        setSelectedRoleForPermissions(null);
        setRolePermissions([]);
      }
    } catch (err) {
      addToast({ type: "error", message: "Failed to delete" });
    }
  };

  const columns = [
    {
      title: "Role Name",
      key: "name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-cyan-600" />
          <span className="font-semibold text-gray-800">{row.name}</span>
          <span className="text-xs text-gray-500">({row.permissions?.length || 0} perms)</span>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (row) => (
        <div className="flex items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openEditModal(row)}
            className="p-2.5 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-700"
          >
            <Pencil className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDeleteRole(row)}
            className="p-2.5 bg-red-100 hover:bg-red-200 rounded-lg text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      ),
    },
  ];
  const columnsVerifiers = [
    {
      title: "Verify Name",
      key: "name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-cyan-600" />
          <span className="font-semibold text-gray-800">{row.name}</span>
          <span className="text-xs text-gray-500">({row.permissions?.length || 0} perms)</span>
        </div>
      ),
    },
    {
      title: "Verifiers",
      key: "name",
      render: (row) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white rounded-full border border-gray-200"></div>
          <div className="w-8 h-8 -ml-2 bg-white rounded-full border border-gray-200"></div>
          <div className="w-8 h-8 -ml-2 bg-white rounded-full border border-gray-200"></div>
          <div className="w-8 h-8 -ml-2 bg-white rounded-full border border-gray-200"></div>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (row) => (
        <div className="flex items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openEditModal(row)}
            className="p-2.5 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-700"
          >
            <Pencil className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDeleteRole(row)}
            className="p-2.5 bg-red-100 hover:bg-red-200 rounded-lg text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      ),
    },
  ];

  console.log({ roles });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-bold text-gray-800">Role & Permission Management</h1>
          {activeTab === "roles" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openCreateModal}
              className="flex items-center gap-3 px-8 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl shadow-lg"
            >
              Create Role
            </motion.button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 ">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                setActiveTab(tab.id);
                selectedRoleForPermissions([]);
              }}
              className={`flex items-center gap-3 pb-4 px-2  transition-all font-semibold ${
                activeTab === tab.id ? "border-cyan-600 text-cyan-600" : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          ))}
        </div>

        <motion.div key={activeTab} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl overflow-hidden">
          {/* ROLES TAB */}
          {activeTab === "roles" && (
            <div className="p-8">
              <DataTable columns={columns} data={roles} className="h-[calc(100vh-320px)]" />
            </div>
          )}

          {/* PERMISSIONS TAB */}
          {activeTab === "permissions" && (
            <div className="px-10 py-4">
              <h2 className="text-lg font-semibold text-gray-600 mb-1 text-center">Manage Role Permissions</h2>

              {/* Role Dropdown Selector */}
              <div className="max-w-2xl flex flex-col items-center mx-auto mb-4">
                <label className="block text-sm font-semibold text-gray-600 mb-6 text-center">Select Role</label>

                <div ref={dropdownRef} className="relative">
                  <motion.button
                    // whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="px-6 w-[300px] py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      {selectedRoleForPermissions ? (
                        <>
                          <Shield className="w-4 h-4 text-cyan-600" />
                          <div className="text-left flex items-center gap-2">
                            <p className="text-sm font-bold text-gray-800">{selectedRoleForPermissions.name}</p>
                            <p className="text-sm text-gray-500">{selectedRoleForPermissions.permissions?.length || 0} permissions</p>
                          </div>
                        </>
                      ) : (
                        <span className="text-xl text-gray-500">Choose a role...</span>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                  </motion.button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden"
                      >
                        <div className="max-h-96 overflow-y-auto">
                          {roles.map((role) => (
                            <motion.div
                              key={role.id}
                              // whileHover={{ backgroundColor: "#f0f9ff" }}
                              onClick={() => handleRoleSelect(role)}
                              className="px-6 py-2 flex items-center gap-5 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-0"
                            >
                              <Shield className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-bold text-gray-800">{role.name}</p>
                                <p className="text-xs text-gray-500">{role.permissions?.length || 0} permissions</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Grouped Permissions */}
              {selectedRoleForPermissions && (
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2  mt-10">
                  {/* Group Definitions */}
                  {[
                    {
                      label: "Vault Management",
                      permissions: allPermissions.filter((p) => p.name.startsWith("vault.")),
                    },
                    {
                      label: "Cash In",
                      permissions: allPermissions.filter((p) => p.name.startsWith("cash-in.")),
                    },
                    {
                      label: "Cash Out",
                      permissions: allPermissions.filter((p) => p.name.startsWith("cash-out.")),
                    },
                    {
                      label: "Reconciliations",
                      permissions: allPermissions.filter((p) => p.name.startsWith("reconciliation.")),
                    },
                    {
                      label: "Users & Roles",
                      permissions: allPermissions.filter((p) => ["user.", "role.", "permission."].some((prefix) => p.name.startsWith(prefix))),
                    },
                    {
                      label: "Reports",
                      permissions: allPermissions.filter((p) => p.name.startsWith("report.")),
                    },
                    {
                      label: "System",
                      permissions: allPermissions.filter(
                        (p) =>
                          !["vault.", "cash-in.", "cash-out.", "reconciliation.", "user.", "role.", "permission.", "report."].some((prefix) =>
                            p.name.startsWith(prefix),
                          ),
                      ),
                    },
                  ].map(
                    (group) =>
                      group.permissions.length > 0 && (
                        <div key={group.label} className="mb-12 ">
                          <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-4">
                            <span className="px-4 py-2 bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-800 rounded-full">{group.label}</span>
                          </h4>

                          <div className="flex gap-2 flex-wrap">
                            {group.permissions.map((perm) => {
                              const isAssigned = rolePermissions?.includes(perm.id);
                              return (
                                <motion.label
                                  key={perm.id}
                                  onClick={() => toggleRolePermission(perm.id)}
                                  whileHover={{ scale: 1.03 }}
                                  className={`flex items-center gap-6 px-4 py-2 rounded-lg cursor-pointer transition-all  border ${
                                    isAssigned ? "bg-green-50 text-green-600 border-green-200" : "bg-white border-gray-200 hover:border-cyan-400"
                                  }`}
                                >
                                  {/* <input
                                    type="checkbox"
                                    checked={isAssigned}
                                    onChange={() => toggleRolePermission(perm.id)}
                                    className="w-3 h-3 rounded focus:ring-0"
                                  /> */}
                                  <div className="flex-1">
                                    <p className={`text-sm font-bold ${isAssigned ? "text-green-600" : "text-gray-800"}`}>
                                      {perm.name.split(".").pop().charAt(0).toUpperCase() + perm.name.split(".").pop().slice(1)}
                                    </p>
                                    {/* <p className={`text-xs ${isAssigned ? "text-green-600" : "text-gray-500"}`}>{perm.name}</p> */}
                                  </div>
                                </motion.label>
                              );
                            })}
                          </div>
                        </div>
                      ),
                  )}
                </motion.div>
              )}

              {/* No Role Selected */}
              {!selectedRoleForPermissions && (
                <div className="text-center py-32">
                  <Key className="w-10 h-10 text-gray-300 mx-auto mb-8" />
                  <p className="text-lg text-gray-500">Select a role from the dropdown above to manage permissions</p>
                </div>
              )}
            </div>
          )}

          {/* verifiers tab*/}
          {activeTab === "verifiers" && (
            <div className="p-8">
              <DataTable columns={columnsVerifiers} data={roles} className="h-[calc(100vh-320px)]" />
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Role Create/Edit Modal */}
      {openRoleModal && (
        <CustomModal isCloseModal={closeModal}>
          <div>
            <h3 className="text-xl font-bold text-center text-cyan-800 mb-8">{isEditMode ? "Edit Role" : "Create New Role"}</h3>

            <form onSubmit={handleSaveRole} className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-3">Role Name</label>
                <input
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  required
                  placeholder="e.g. Cash Verifier"
                  className="w-full px-6 py-2 border border-gray-200 rounded-lg focus:border-cyan-500 outline-none text-lg"
                />
              </div>

              <div className="flex gap-5 ">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="flex-1 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-bold shadow-lg"
                >
                  {isEditMode ? "Update Role" : "Create Role"}
                </motion.button>
              </div>
            </form>
          </div>
        </CustomModal>
      )}

      {/* Delete Confirmation */}
      {isDeleteRole && (
        <CustomModal isCloseModal={() => setIsDeleteRole(false)}>
          <div className="p-10 text-center">
            <Trash2 className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Delete Role "{selectedRoleForDelete?.name}"?</h3>
            <p className="text-gray-600 mb-10">This action cannot be undone.</p>
            <div className="flex gap-6 justify-center">
              <button
                onClick={() => setIsDeleteRole(false)}
                className="px-10 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={confirmDeleteRole}
                className="px-12 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-bold shadow-lg"
              >
                Yes, Delete
              </motion.button>
            </div>
          </div>
        </CustomModal>
      )}
    </div>
  );
};

export default RolePermissionManager;
