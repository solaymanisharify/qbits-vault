import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { motion } from "framer-motion";
import { SignIn } from "../../services/Auth";

import { useToast } from "../../hooks/useToast";
import { useDispatch } from "react-redux";
import { login } from "../../store/authSlice";
import ForgetPasswordModel from "../../components/forgetPassword/ForgetPasswordModel";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [openForgetPasswordModel, setOpenForgetPasswordModel] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      SignIn({ email, password }).then((res) => {
        if (res?.success === true) {
          const auth = {
            access_token: res?.data?.access_token,
            user: res?.data?.user,
          };
          dispatch(login(auth));
          localStorage.setItem("auth", JSON.stringify(auth));
          navigate("/");
        } else if (res?.status === 401) {
          addToast({
            type: "error",
            message: res?.data?.message,
          });
          // toast.error(res?.data?.message, {
          //   style: {
          //     borderRadius: "10px",
          //     background: "#355fa5",
          //     color: "#fff",
          //   },
          // });
        }
      });
    } catch (error) {
      console.log("come here");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-cyan-300/10 to-purple-300/10  flex items-center justify-center px-4 overflow-hidden relative">
      {/* Animated Background Orbs */}
      {/* <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
      </div> */}

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-xl p-10 overflow-hidden">
          {/* Glow effect */}
          {/* <div className="absolute inset-0 bg-gradient-to-r from-cyan-300/10 to-purple-300/10 rounded-3xl -z-10"></div> */}

          <div className="text-center mb-10">
            {/* Logo / Icon */}
            {/* <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-2xl shadow-lg mb-6"
            >
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </motion.div> */}

            <h1 className="text-4xl font-bold text-gray-600 mb-2 tracking-tight">QBits Vault</h1>
            <p className="text-gray-400 text-sm">Access your secure vault</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="relative">
              <div className="absolute inset-0 bg-gray-100 rounded-xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity"></div>
              <div className="relative bg-gray-100 backdrop-blur-md border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 transition-all hover:bg-white/20 focus-within:bg-white/20">
                <FiUser className="text-xl text-gray-600" />
                <input
                  type="text"
                  placeholder="Username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-gray-600 placeholder-gray-400 outline-none text-lg"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="absolute inset-0 bg-gray-100  rounded-xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity"></div>
              <div className="relative bg-gray-100 backdrop-blur-md border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 transition-all hover:bg-white/20 focus-within:bg-white/20">
                <FiLock className="text-xl text-gray-600" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-gray-600 placeholder-gray-400 outline-none text-lg flex-1"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-white transition">
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-3 cursor-pointer">
                {/* <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-500 bg-white/10 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                />
                <span className="text-gray-300">Remember me</span> */}
              </label>
              <div onClick={() => setOpenForgetPasswordModel(true)} className="text-cyan-500 cursor-pointer hover:text-cyan-300 transition font-medium">
                {/* Forgot password? */}
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 transform hover:translate-y-[-2px]"
            >
              Login
            </motion.button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-8">Product of QBits Computer</p>
        </div>
      </motion.div>

      {openForgetPasswordModel && <ForgetPasswordModel isCloseModal={() => setOpenForgetPasswordModel(false)} />}
    </div>
  );
};

export default Login;
