import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Save } from "lucide-react";

const Profile = () => {
  //   const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john@example.com");
  const [phone, setPhone] = useState("+1234567890");
  const [avatar, setAvatar] = useState(
    "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80"
  ); // default
  const [isEditing, setIsEditing] = useState(false);
  //   const user = authUser; // from your auth context\\

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "password", label: "Change Password" },
    { id: "permissions", label: "My Permissions" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium transition ${
              activeTab === tab.id ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "profile" && (
        <div>
          <div className="min-h-screen  py-12 px-4">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl mx-auto">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* Header with Gradient */}
                <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                <div className="relative px-8 pb-12 -mt-20">
                  {/* Avatar */}
                  <motion.div whileHover={{ scale: 1.05 }} className="relative inline-block">
                    <img src={avatar} alt="Profile" className="w-40 h-40 rounded-full border-8 border-white shadow-xl object-cover" />
                    {isEditing && (
                      <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer hover:bg-black/50 transition">
                        <Camera className="w-10 h-10 text-white" />
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                    )}
                  </motion.div>

                  {/* User Info */}
                  <div className="mt-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                      {isEditing ? (
                        <input value={name} onChange={(e) => setName(e.target.value)} className="px-4 py-2 border rounded-lg w-full max-w-md" />
                      ) : (
                        name
                      )}
                    </h1>

                    <div className="mt-6 space-y-4">
                      <div>
                        <label className="text-sm text-gray-500">Email</label>
                        {isEditing ? (
                          <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 px-4 py-2 border rounded-lg w-full max-w-md" />
                        ) : (
                          <p className="text-lg text-gray-700">{email}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm text-gray-500">Phone</label>
                        {isEditing ? (
                          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 px-4 py-2 border rounded-lg w-full max-w-md" />
                        ) : (
                          <p className="text-lg text-gray-700">{phone || "Not set"}</p>
                        )}
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-10 flex gap-4">
                      {isEditing ? (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            // onClick={handleSave}
                            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg"
                          >
                            <Save className="w-5 h-5" /> Save Changes
                          </motion.button>
                          <button onClick={() => setIsEditing(false)} className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium">
                            Cancel
                          </button>
                        </>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsEditing(true)}
                          className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg"
                        >
                          Edit Profile
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
      {/* {activeTab === "password" && <PasswordChangeSection addToast={addToast} />}
      {activeTab === "permissions" && <PermissionsSection user={user} />} */}
    </div>
  );
};

export default Profile;
