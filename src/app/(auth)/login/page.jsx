"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMail,
  FiLock,
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import {
  FaCheckCircle,
  FaShieldAlt,
  FaUserGraduate,
  FaHeadphones,
  FaBook,
  FaPen,
} from "react-icons/fa";
import { LuShieldCheck } from "react-icons/lu";
import { HiOutlineDocumentText } from "react-icons/hi";
import { authAPI } from "@/lib/api";
import Logo from "@/components/Logo";

const Login = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isChecking, setIsChecking] = useState(true);

  // Check if already logged in
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      if (token && user) {
        const userData = JSON.parse(user);
        if (userData.role === "admin") {
          router.replace("/dashboard/admin/dashboard");
          return;
        } else {
          router.replace("/dashboard/student");
          return;
        }
      }
    } catch (e) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("adminAuth");
    }
    setIsChecking(false);
  }, []);

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setFormData((prev) => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const response = await authAPI.login(formData.email, formData.password);

      if (response?.data?.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        if (response.data.user.role === "admin") {
          localStorage.setItem(
            "adminAuth",
            JSON.stringify({
              email: response.data.user.email,
              name: response.data.user.name,
              role: response.data.user.role,
              token: response.data.token,
              isAdmin: true,
            })
          );
        }

        if (rememberMe) {
          localStorage.setItem("rememberedEmail", formData.email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        if (response.data.user.role === "admin") {
          router.push("/dashboard/admin/dashboard");
        } else {
          router.push("/dashboard/student");
        }
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#fdfbf9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#C4122F] border-t-transparent mx-auto mb-3"></div>
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      {/* Background — Matching homepage warm theme */}
      <div className="absolute inset-0 bg-[#fdfbf9]">
        {/* Animated soft gradient blobs */}
        <motion.div
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -25, 15, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-15%] right-[-5%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle, rgba(196,18,47,0.15) 0%, rgba(255,182,193,0.12) 40%, transparent 70%)",
          }}
        />
        <motion.div
          animate={{
            x: [0, -20, 25, 0],
            y: [0, 20, -15, 0],
            scale: [1, 0.95, 1.08, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[650px] max-h-[650px] rounded-full opacity-35"
          style={{
            background:
              "radial-gradient(circle, rgba(255,160,140,0.18) 0%, rgba(255,200,180,0.10) 45%, transparent 70%)",
          }}
        />
        <motion.div
          animate={{
            x: [0, 15, -10, 0],
            y: [0, -10, 20, 0],
            scale: [1, 1.05, 0.98, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[30%] left-[25%] w-[35vw] h-[35vw] max-w-[450px] max-h-[450px] rounded-full opacity-25"
          style={{
            background:
              "radial-gradient(circle, rgba(196,18,47,0.08) 0%, rgba(255,220,210,0.10) 50%, transparent 70%)",
          }}
        />
        <motion.div
          animate={{
            x: [0, -15, 10, 0],
            y: [0, 15, -20, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[50%] w-[25vw] h-[25vw] max-w-[350px] max-h-[350px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(255,200,150,0.20) 0%, transparent 60%)",
          }}
        />

        {/* Soft dots pattern */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(196,18,47,0.25) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
          className="absolute top-[18%] right-[15%] w-24 h-24 rounded-full border border-[#C4122F]/[0.06]"
        />
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[25%] right-[28%] w-2 h-2 rounded-full bg-[#C4122F]/15"
        />
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[35%] left-[10%] w-1.5 h-1.5 rounded-full bg-rose-300/30"
        />
        <motion.div
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[60%] left-[6%] w-12 h-px bg-gradient-to-r from-[#C4122F]/15 to-transparent"
        />
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[25%] right-[8%] w-1.5 h-1.5 rounded-full bg-[#C4122F]/10"
        />
      </div>

      {/* Header */}
      <header className="relative z-20 py-4 px-6 md:px-10 border-b border-slate-200/60 bg-white/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between max-w-7xl mx-auto"
        >
          <Link href="/">
            <Logo />
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 text-slate-400 text-sm px-3">
              <LuShieldCheck className="text-emerald-500 text-base" />
              <span className="text-slate-500 font-medium">Secure</span>
            </div>

            <Link
              href="/"
              className="px-5 py-2 bg-white/70 backdrop-blur-sm text-slate-700 rounded-lg font-medium text-sm hover:bg-white transition-all cursor-pointer flex items-center gap-2 border border-slate-200/60 shadow-sm"
            >
              <FiArrowLeft className="text-xs" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
          </div>
        </motion.div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 md:px-10 py-10">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Content — Branding & Features */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="lg:col-span-7 hidden lg:block"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-[#C4122F]/[0.06] border border-[#C4122F]/10 rounded-full px-4 py-1.5 mb-6"
            >
              <span className="w-1.5 h-1.5 bg-[#C4122F] rounded-full animate-pulse"></span>
              <span className="text-[#C4122F]/70 text-[11px] font-semibold uppercase tracking-widest">
                Secure Portal Access
              </span>
            </motion.div>

            {/* Main Heading */}
            <h1 className="text-3xl md:text-[2.6rem] lg:text-[3rem] font-extrabold leading-[1.12] tracking-tight mb-4">
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #C4122F, #E8354F)",
                }}
              >
                Welcome to Your
              </span>
              <br />
              <span className="text-slate-900">IELTS Exam Portal</span>
            </h1>

            <p className="text-slate-500 text-base md:text-lg leading-relaxed mb-8 max-w-lg">
              Sign in to access your{" "}
              <strong className="text-[#C4122F]">
                mock tests, results, and progress tracking
              </strong>{" "}
              — everything you need to ace your IELTS exam.
            </p>

            {/* Feature highlights */}
            <div className="space-y-4 mb-8">
              {[
                {
                  icon: <FaHeadphones className="text-sm" />,
                  title: "Full Mock Tests",
                  desc: "Listening, Reading & Writing modules",
                  gradient: "from-violet-500 to-purple-600",
                },
                {
                  icon: <FaShieldAlt className="text-sm" />,
                  title: "Secure Environment",
                  desc: "Proctored exam experience",
                  gradient: "from-amber-500 to-orange-500",
                },
                {
                  icon: <FaUserGraduate className="text-sm" />,
                  title: "Track Progress",
                  desc: "View scores and detailed analytics",
                  gradient: "from-emerald-500 to-teal-600",
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.12 }}
                  className="flex items-center gap-4"
                >
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white shadow-md`}
                  >
                    {feature.icon}
                  </div>
                  <div>
                    <p className="text-slate-900 font-semibold text-sm">
                      {feature.title}
                    </p>
                    <p className="text-slate-400 text-xs">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 md:gap-10">
              {[
                { value: "5,000+", label: "Students Tested" },
                { value: "Band 7+", label: "Avg. Score" },
                { value: "24/7", label: "Available" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                >
                  <p className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-slate-400 text-xs font-medium mt-1 uppercase tracking-wider">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right — Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7 }}
            className="lg:col-span-5 w-full max-w-[440px] mx-auto lg:mx-0 lg:ml-auto"
          >
            <div className="relative">
              {/* Glow behind card */}
              <div className="absolute -inset-3 bg-[#C4122F]/[0.04] rounded-[2rem] blur-xl"></div>

              <div className="relative bg-white border border-slate-200/80 rounded-2xl p-7 shadow-xl shadow-slate-200/50">
                {/* Card Header */}
                <div className="text-center mb-6">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-[#C4122F] to-[#E8354F] rounded-xl flex items-center justify-center shadow-lg shadow-[#C4122F]/20">
                    <FaUserGraduate className="text-white text-xl" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Welcome Back
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">
                    Sign in to your IELTS exam portal
                  </p>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      className="mb-5 p-3.5 rounded-xl flex items-center gap-2.5 bg-red-50 border border-red-100"
                    >
                      <FiAlertCircle className="text-red-500 flex-shrink-0" size={16} />
                      <p className="text-red-600 text-sm">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-slate-600 text-xs mb-1.5 font-semibold uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                      <input
                        type="email"
                        name="email"
                        id="login-email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="you@example.com"
                        className={`w-full bg-slate-50 border rounded-lg pl-10 pr-4 py-3 text-slate-900 placeholder-slate-300 focus:border-[#C4122F]/50 focus:bg-white focus:ring-2 focus:ring-[#C4122F]/10 outline-none transition-all text-sm ${validationErrors.email
                          ? "border-red-300"
                          : "border-slate-200"
                          }`}
                        autoComplete="email"
                      />
                    </div>
                    {validationErrors.email && (
                      <p className="mt-1.5 text-red-500 text-xs">
                        {validationErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-slate-600 text-xs mb-1.5 font-semibold uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        id="login-password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter your password"
                        className={`w-full bg-slate-50 border rounded-lg pl-10 pr-12 py-3 text-slate-900 placeholder-slate-300 focus:border-[#C4122F]/50 focus:bg-white focus:ring-2 focus:ring-[#C4122F]/10 outline-none transition-all text-sm ${validationErrors.password
                          ? "border-red-300"
                          : "border-slate-200"
                          }`}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                      >
                        {showPassword ? (
                          <FiEyeOff size={16} />
                        ) : (
                          <FiEye size={16} />
                        )}
                      </button>
                    </div>
                    {validationErrors.password && (
                      <p className="mt-1.5 text-red-500 text-xs">
                        {validationErrors.password}
                      </p>
                    )}
                  </div>

                  {/* Remember Me & Forgot */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-start gap-2.5 cursor-pointer group">
                      <div className="relative mt-0.5">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded border border-slate-300 bg-white checked:bg-[#C4122F] checked:border-[#C4122F] appearance-none cursor-pointer transition-all"
                        />
                        {rememberMe && (
                          <FaCheckCircle className="absolute inset-0 text-white w-4 h-4 pointer-events-none" />
                        )}
                      </div>
                      <span className="text-slate-400 text-xs font-medium group-hover:text-slate-600 transition-colors">
                        Remember me
                      </span>
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-[#C4122F] hover:text-[#a50f27] transition-colors font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    id="login-submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#C4122F] to-[#E8354F] text-white py-3 rounded-lg font-bold text-sm hover:shadow-xl hover:shadow-[#C4122F]/30 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Signing in...
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <FiArrowRight className="text-xs" />
                      </>
                    )}
                  </button>
                </form>

                {/* Info Box */}
                <div className="mt-5 p-3.5 rounded-xl flex items-start gap-3 bg-[#C4122F]/[0.04] border border-[#C4122F]/10">
                  <div className="w-5 h-5 rounded-full bg-[#C4122F]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#C4122F] text-[10px] font-bold">
                      i
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    <span className="font-semibold text-slate-700">
                      Students:
                    </span>{" "}
                    Use your registered email and phone number as password.
                  </p>
                </div>

                {/* Security */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <FaShieldAlt className="text-amber-500 flex-shrink-0" />
                    <p>
                      Secure login · 256-bit SSL encrypted connection
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Back to Home — Mobile */}
            <div className="mt-5 text-center lg:hidden">
              <Link
                href="/"
                className="text-sm text-slate-500 hover:text-[#C4122F] transition-colors inline-flex items-center gap-1.5"
              >
                <FiArrowLeft className="text-xs" />
                Back to Home
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-6 px-6 md:px-10 border-t border-slate-200/60 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-slate-400 text-xs font-medium">
          <div className="flex items-center gap-2">
            <Logo size="small" />
            <span className="text-slate-200 mx-1">|</span>
            <p>
              © {new Date().getFullYear()} Best IELTS BD. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-5">
            <span className="hover:text-[#C4122F] cursor-pointer transition-colors">
              Privacy
            </span>
            <span className="hover:text-[#C4122F] cursor-pointer transition-colors">
              Terms
            </span>
            <span className="hover:text-[#C4122F] cursor-pointer transition-colors">
              Support
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-400">Developed by <a href="https://extrainweb.com" target="_blank" rel="noopener noreferrer" className="text-[#C4122F] hover:text-[#a50f27] transition-colors font-semibold">ExtraInWeb.com</a></span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
