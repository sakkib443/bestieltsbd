"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaPlay,
    FaCheckCircle,
    FaShieldAlt,
    FaExclamationTriangle,
    FaKeyboard,
    FaHeadphones,
    FaBook,
    FaPen,
    FaClock,
    FaLaptop,
    FaWifi,
    FaTimes,
    FaExclamationCircle,
    FaArrowRight,
    FaVideo,
    FaUserGraduate,
    FaAward,
    FaGlobe,
    FaChevronDown,
    FaQuoteLeft,
    FaStar,
    FaChevronUp,
    FaQuestionCircle
} from "react-icons/fa";
import { LuShieldCheck } from "react-icons/lu";
import { HiOutlineDocumentText } from "react-icons/hi";
import { studentsAPI } from "@/lib/api";
import Logo from "@/components/Logo";

// Toast Popup Component
const ToastPopup = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => { onClose(); }, 6000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
        error: <FaExclamationCircle className="text-xl" />,
        warning: <FaExclamationTriangle className="text-xl" />,
        success: <FaCheckCircle className="text-xl" />,
    };
    const colors = {
        error: "from-red-600 to-rose-700",
        warning: "from-amber-500 to-orange-600",
        success: "from-green-500 to-emerald-600",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] w-full max-w-md px-4"
        >
            <div className={`bg-gradient-to-r ${colors[type]} text-white rounded-2xl shadow-2xl overflow-hidden`}>
                <div className="px-5 py-4 flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        {icons[type]}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-lg mb-0.5">
                            {type === "error" ? "Oops!" : type === "warning" ? "Warning" : "Success"}
                        </p>
                        <p className="text-white/90 text-sm leading-relaxed">{message}</p>
                    </div>
                    <button onClick={onClose} className="flex-shrink-0 w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors">
                        <FaTimes />
                    </button>
                </div>
                <motion.div initial={{ width: "100%" }} animate={{ width: "0%" }} transition={{ duration: 6, ease: "linear" }} className="h-1 bg-white/30" />
            </div>
        </motion.div>
    );
};

export default function HomePage() {
    const router = useRouter();
    const [examId, setExamId] = useState("");
    const [toast, setToast] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [showDemoVideo, setShowDemoVideo] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);

    const parseErrorMessage = (error) => {
        if (typeof error === "string") {
            if (error.startsWith("[") || error.startsWith("{")) {
                try {
                    const parsed = JSON.parse(error);
                    if (Array.isArray(parsed) && parsed[0]?.message) return cleanErrorMessage(parsed[0].message);
                    if (parsed.message) return cleanErrorMessage(parsed.message);
                } catch (e) { }
            }
            return cleanErrorMessage(error);
        }
        if (Array.isArray(error) && error[0]?.message) return cleanErrorMessage(error[0].message);
        if (error?.message) return cleanErrorMessage(error.message);
        return "Something went wrong. Please try again.";
    };

    const cleanErrorMessage = (msg) => {
        const messageMap = {
            "Invalid Exam ID format": "Invalid Exam ID format. Example: BACIELTS260001",
            "Invalid Exam ID": "This Exam ID does not exist. Please check and try again.",
            "Payment not confirmed": "Your payment is not confirmed yet. Please contact admin.",
            "This account has been deactivated": "Your account has been deactivated. Please contact admin.",
            "You have already completed this exam": "You have already completed this exam.",
            "Your exam was terminated": "Your exam was terminated due to violations. Please contact admin.",
            "You have an exam in progress": "You already have an exam in progress. Please contact admin.",
        };
        for (const [pattern, friendly] of Object.entries(messageMap)) {
            if (msg.toLowerCase().includes(pattern.toLowerCase())) return friendly;
        }
        let cleaned = msg.replace(/^body\.\w+:\s*/i, "").replace(/\(e\.g\.,?\s*[A-Z0-9]+\)/i, "");
        return cleaned.trim() || "Something went wrong. Please try again.";
    };

    const showToast = (message, type = "error") => {
        setToast({ message: parseErrorMessage(message), type });
    };

    const handleStartExam = async (e) => {
        e.preventDefault();
        if (!examId.trim()) { showToast("Please enter your Exam ID to continue", "warning"); return; }
        if (examId.trim().length < 4) { showToast("The Exam ID format is invalid. Please check and try again.", "error"); return; }
        if (!agreed) { showToast("Please accept the terms and conditions before starting", "warning"); return; }

        setIsLoading(true);
        try {
            const verifyResponse = await studentsAPI.verifyExamId(examId.trim());
            if (!verifyResponse.success || !verifyResponse.data?.valid) {
                showToast(verifyResponse.data?.message || "Invalid Exam ID. Please check and try again.", "error");
                setIsLoading(false);
                return;
            }
            const startResponse = await studentsAPI.startExam(examId.trim(), "", "");
            if (startResponse.success && startResponse.data) {
                localStorage.removeItem("examSession");
                localStorage.setItem("examSession", JSON.stringify({
                    sessionId: startResponse.data.sessionId,
                    examId: startResponse.data.examId,
                    studentName: startResponse.data.studentName,
                    assignedSets: startResponse.data.assignedSets,
                    startedAt: startResponse.data.startedAt,
                    completedModules: startResponse.data.completedModules || [],
                    scores: startResponse.data.scores || null
                }));
                router.push(`/exam/${startResponse.data.sessionId}`);
            } else {
                showToast("Failed to start exam. Please try again.", "error");
            }
        } catch (err) {
            showToast(err.message || "An error occurred. Please try again.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const examModules = [
        { name: "Listening", icon: <FaHeadphones />, duration: "30 min", questions: "40 Questions", desc: "Audio-based questions testing comprehension", gradient: "from-violet-500 to-purple-600" },
        { name: "Reading", icon: <FaBook />, duration: "60 min", questions: "40 Questions", desc: "Passage-based comprehension assessment", gradient: "from-blue-500 to-indigo-600" },
        { name: "Writing", icon: <FaPen />, duration: "60 min", questions: "2 Tasks", desc: "Essay and report writing evaluation", gradient: "from-emerald-500 to-teal-600" },
    ];

    return (
        <div className="min-h-screen bg-white relative overflow-hidden" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            {/* Toast */}
            <AnimatePresence>
                {toast && <ToastPopup message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </AnimatePresence>

            {/* Demo Video Modal */}
            <AnimatePresence>
                {showDemoVideo && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowDemoVideo(false)}>
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center"><FaVideo className="text-[#C4122F] text-sm" /></div>
                                    <div><h3 className="font-semibold text-gray-800 text-sm">Exam Instruction</h3><p className="text-gray-400 text-[11px]">Learn how the exam works</p></div>
                                </div>
                                <button onClick={() => setShowDemoVideo(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"><FaTimes /></button>
                            </div>
                            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}><iframe className="absolute inset-0 w-full h-full" src="https://www.youtube.com/embed/3SUAfSU0VNo?autoplay=1&rel=0" title="IELTS Exam Demo" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>
                            <div className="px-5 py-3 bg-gray-50 flex items-center justify-between">
                                <p className="text-gray-500 text-xs">Watch this video before starting your exam</p>
                                <button onClick={() => setShowDemoVideo(false)} className="px-4 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-black transition-colors cursor-pointer">Close</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ===== HERO SECTION ===== */}
            <div className="relative min-h-[82vh] flex flex-col overflow-hidden">
                {/* Background — Soft animated gradient */}
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
                        style={{ background: 'radial-gradient(circle, rgba(196,18,47,0.15) 0%, rgba(255,182,193,0.12) 40%, transparent 70%)' }}
                    />
                    <motion.div
                        animate={{
                            x: [0, -20, 25, 0],
                            y: [0, 20, -15, 0],
                            scale: [1, 0.95, 1.08, 1],
                        }}
                        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[650px] max-h-[650px] rounded-full opacity-35"
                        style={{ background: 'radial-gradient(circle, rgba(255,160,140,0.18) 0%, rgba(255,200,180,0.10) 45%, transparent 70%)' }}
                    />
                    <motion.div
                        animate={{
                            x: [0, 15, -10, 0],
                            y: [0, -10, 20, 0],
                            scale: [1, 1.05, 0.98, 1],
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[30%] left-[25%] w-[35vw] h-[35vw] max-w-[450px] max-h-[450px] rounded-full opacity-25"
                        style={{ background: 'radial-gradient(circle, rgba(196,18,47,0.08) 0%, rgba(255,220,210,0.10) 50%, transparent 70%)' }}
                    />
                    {/* Subtle warm accent */}
                    <motion.div
                        animate={{
                            x: [0, -15, 10, 0],
                            y: [0, 15, -20, 0],
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[10%] left-[50%] w-[25vw] h-[25vw] max-w-[350px] max-h-[350px] rounded-full opacity-20"
                        style={{ background: 'radial-gradient(circle, rgba(255,200,150,0.20) 0%, transparent 60%)' }}
                    />

                    {/* Soft subtle dots pattern */}
                    <div className="absolute inset-0 opacity-[0.035]" style={{
                        backgroundImage: `radial-gradient(circle, rgba(196,18,47,0.25) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}></div>
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
                </div>

                {/* Header */}
                <header className="relative z-20 py-4 px-6 md:px-10 border-b border-slate-200/60 bg-white/60 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex items-center justify-between max-w-7xl mx-auto"
                    >
                        <Logo />

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowDemoVideo(true)}
                                className="relative px-4 py-2 bg-white/70 backdrop-blur-sm text-slate-700 rounded-lg font-medium text-sm hover:bg-white transition-all cursor-pointer flex items-center gap-2 border border-slate-200/60 shadow-sm"
                            >
                                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C4122F] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#C4122F]"></span>
                                </span>
                                <FaVideo className="text-xs text-[#C4122F]" />
                                <span className="hidden sm:inline">Exam Instruction</span>
                            </button>

                            <div className="hidden md:flex items-center gap-1.5 text-slate-400 text-sm px-3">
                                <LuShieldCheck className="text-emerald-500 text-base" />
                                <span className="text-slate-500 font-medium">Secure</span>
                            </div>

                            <button
                                onClick={() => router.push("/login")}
                                className="px-5 py-2 bg-[#C4122F] text-white rounded-lg font-semibold text-sm hover:bg-[#a50f27] transition-all cursor-pointer hover:shadow-lg hover:shadow-[#C4122F]/20"
                            >
                                Login
                            </button>
                        </div>
                    </motion.div>
                </header>

                {/* Hero Main Content */}
                <div className="relative z-10 flex-1 flex items-center px-6 md:px-10 py-10">
                    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

                        {/* Left Content — 7 columns */}
                        <motion.div
                            initial={{ opacity: 0, y: 25 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, duration: 0.7 }}
                            className="lg:col-span-7"
                        >
                            {/* Badge */}
                            <motion.div
                                initial={{ opacity: 0, x: -15 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="inline-flex items-center gap-2 bg-[#C4122F]/[0.06] border border-[#C4122F]/10 rounded-full px-4 py-1.5 mb-6"
                            >
                                <span className="w-1.5 h-1.5 bg-[#C4122F] rounded-full animate-pulse"></span>
                                <span className="text-[#C4122F]/70 text-[11px] font-semibold uppercase tracking-widest">100% Authentic Exam Experience</span>
                            </motion.div>

                            {/* Main Heading — Smaller */}
                            <h1 className="text-3xl md:text-[2.6rem] lg:text-[3rem] font-extrabold leading-[1.12] tracking-tight mb-4">
                                <span className="text-transparent bg-clip-text" style={{
                                    backgroundImage: 'linear-gradient(135deg, #C4122F, #E8354F)'
                                }}>Bangladesh's Best Online</span>
                                <br />
                                <span className="text-transparent bg-clip-text" style={{
                                    backgroundImage: 'linear-gradient(135deg, #C4122F, #E8354F)'
                                }}>IELTS Mock Tests</span>
                                <br />
                                <span className="text-slate-900">Practice Platform</span>
                            </h1>


                            <p className="text-slate-500 text-base md:text-lg leading-relaxed mb-8 max-w-lg">
                                Prepare for your IELTS exam with our{" "}
                                <strong className="text-[#C4122F]">Official-Style Computer-Based Mock Tests</strong>{" "}
                                — real exam format, instant results, anytime, anywhere!
                            </p>

                            {/* Feature highlights — row */}
                            <div className="flex items-center gap-6 mb-8">
                                {[
                                    { icon: <FaHeadphones className="text-sm" />, title: "Full Mock Tests", desc: "Listening, Reading & Writing", gradient: "from-violet-500 to-purple-600" },
                                    { icon: <FaShieldAlt className="text-sm" />, title: "Secure Environment", desc: "Proctored exam experience", gradient: "from-amber-500 to-orange-500" },
                                    { icon: <FaUserGraduate className="text-sm" />, title: "Track Progress", desc: "Scores & detailed analytics", gradient: "from-emerald-500 to-teal-600" },
                                ].map((feature, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.45 + i * 0.1 }}
                                        className="flex items-center gap-3"
                                    >
                                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white shadow-md flex-shrink-0`}>
                                            {feature.icon}
                                        </div>
                                        <div>
                                            <p className="text-slate-900 font-semibold text-sm leading-tight">{feature.title}</p>
                                            <p className="text-slate-400 text-[11px]">{feature.desc}</p>
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
                                        transition={{ delay: 0.5 + i * 0.1 }}
                                    >
                                        <p className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                                        <p className="text-slate-400 text-xs font-medium mt-1 uppercase tracking-wider">{stat.label}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Right — Exam Card — 5 columns */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25, duration: 0.7 }}
                            className="lg:col-span-5 w-full max-w-[420px] mx-auto lg:mx-0 lg:ml-auto"
                        >
                            <div className="relative">
                                {/* Glow behind card */}
                                <div className="absolute -inset-3 bg-[#C4122F]/[0.04] rounded-[2rem] blur-xl"></div>

                                <div className="relative bg-white border border-slate-200/80 rounded-2xl p-7 shadow-xl shadow-slate-200/50">
                                    {/* Card Header */}
                                    <div className="text-center mb-6">
                                        <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-[#C4122F] to-[#E8354F] rounded-xl flex items-center justify-center shadow-lg shadow-[#C4122F]/20">
                                            <HiOutlineDocumentText className="text-white text-xl" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900">Start Your Exam</h3>
                                        <p className="text-slate-400 text-sm mt-1">Enter your Exam ID to begin</p>
                                    </div>

                                    {/* Form */}
                                    <form onSubmit={handleStartExam} className="space-y-4">
                                        <div>
                                            <label className="block text-slate-600 text-xs mb-1.5 font-semibold uppercase tracking-wider">Exam ID</label>
                                            <div className="relative">
                                                <FaKeyboard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                                                <input
                                                    type="text"
                                                    value={examId}
                                                    onChange={(e) => setExamId(e.target.value.toUpperCase())}
                                                    placeholder="BACIELTS240001"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-3 text-slate-900 placeholder-slate-300 focus:border-[#C4122F]/50 focus:bg-white focus:ring-2 focus:ring-[#C4122F]/10 outline-none transition-all text-sm font-mono tracking-[0.15em]"
                                                    autoComplete="off"
                                                    spellCheck="false"
                                                />
                                            </div>
                                        </div>

                                        {/* Agreement */}
                                        <label className="flex items-start gap-2.5 cursor-pointer group">
                                            <div className="relative mt-0.5">
                                                <input
                                                    type="checkbox"
                                                    checked={agreed}
                                                    onChange={(e) => setAgreed(e.target.checked)}
                                                    className="w-4 h-4 rounded border border-slate-300 bg-white checked:bg-[#C4122F] checked:border-[#C4122F] appearance-none cursor-pointer transition-all"
                                                />
                                                {agreed && <FaCheckCircle className="absolute inset-0 text-white w-4 h-4 pointer-events-none" />}
                                            </div>
                                            <span className="text-slate-400 text-xs font-medium group-hover:text-slate-600 transition-colors leading-relaxed">
                                                I agree to the exam rules and understand my activity will be monitored.
                                            </span>
                                        </label>

                                        {/* Submit */}
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#C4122F] to-[#E8354F] text-white py-3 rounded-lg font-bold text-sm hover:shadow-xl hover:shadow-[#C4122F]/30 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    Verifying...
                                                </>
                                            ) : (
                                                <>
                                                    <FaPlay className="text-xs" />
                                                    <span>Start Examination</span>
                                                    <FaArrowRight className="text-xs" />
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    {/* Or Divider */}
                                    <div className="flex items-center gap-3 my-4">
                                        <div className="flex-1 h-px bg-slate-200"></div>
                                        <span className="text-slate-400 text-xs font-medium">or</span>
                                        <div className="flex-1 h-px bg-slate-200"></div>
                                    </div>

                                    {/* Free Demo Exam Button */}
                                    <button
                                        onClick={() => {
                                            // Create a demo session in localStorage
                                            localStorage.removeItem("examSession");
                                            localStorage.setItem("examSession", JSON.stringify({
                                                sessionId: "DEMO-SESSION",
                                                examId: "DEMO-FREE",
                                                studentName: "Demo Student",
                                                isDemo: true,
                                                assignedSets: {
                                                    listeningSetNumber: 2,
                                                    readingSetNumber: 2,
                                                    writingSetNumber: 2,
                                                    fullSets: [{
                                                        label: "Demo Set (Set 2)",
                                                        listeningSetNumber: 2,
                                                        readingSetNumber: 2,
                                                        writingSetNumber: 2,
                                                    }]
                                                },
                                                startedAt: new Date().toISOString(),
                                                completedModules: [],
                                                scores: null
                                            }));
                                            router.push("/exam/DEMO-SESSION");
                                        }}
                                        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#C4122F]/25 text-[#C4122F] py-2.5 rounded-lg font-semibold text-sm hover:bg-[#C4122F]/[0.04] hover:border-[#C4122F]/40 transition-all cursor-pointer"
                                    >
                                        <span>✨</span>
                                        <span>Free Demo Exam</span>
                                    </button>

                                    {/* Security */}
                                    <div className="mt-5 pt-4 border-t border-slate-100">
                                        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                                            <FaShieldAlt className="text-amber-500 flex-shrink-0" />
                                            <p>Secure environment · Tab switching monitored</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="relative z-10 pb-8 flex justify-center"
                >
                    <motion.div
                        animate={{ y: [0, 6, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-slate-300 text-sm cursor-pointer hover:text-[#C4122F] transition-colors"
                        onClick={() => document.getElementById('modules')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        <FaChevronDown />
                    </motion.div>
                </motion.div>
            </div>

            {/* ===== EXAM MODULES ===== */}
            <section id="modules" className="py-20 px-6 md:px-10 bg-[#FAFBFC]">
                <div className="max-w-6xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
                        <span className="inline-block px-4 py-1.5 bg-[#C4122F]/8 text-[#C4122F] rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-[#C4122F]/10">
                            Exam Modules
                        </span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
                            Complete IELTS Experience
                        </h2>
                        <p className="text-slate-500 text-base max-w-lg mx-auto">
                            Practice all three modules in a realistic computer-based test environment
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {examModules.map((mod, index) => (
                            <motion.div
                                key={mod.name}
                                initial={{ opacity: 0, y: 25 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.12 }}
                                className="group bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300 hover:border-slate-200"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mod.gradient} flex items-center justify-center text-white text-lg mb-5 shadow-md group-hover:scale-105 transition-transform duration-300`}>
                                    {mod.icon}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1.5">{mod.name}</h3>
                                <p className="text-slate-400 text-sm mb-4 leading-relaxed">{mod.desc}</p>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
                                        <FaClock className="text-[#C4122F] text-[10px]" />
                                        {mod.duration}
                                    </span>
                                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                    <span className="text-slate-600 font-semibold">{mod.questions}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== REQUIREMENTS ===== */}
            <section className="py-16 px-6 md:px-10 bg-white">
                <div className="max-w-6xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">Before You Start</h2>
                        <p className="text-slate-400 text-sm font-medium">Make sure you have everything ready</p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: <FaLaptop />, title: "Computer", desc: "Desktop or laptop" },
                            { icon: <FaHeadphones />, title: "Headphones", desc: "For listening test" },
                            { icon: <FaWifi />, title: "Internet", desc: "Stable connection" },
                            { icon: <FaClock />, title: "2.5 Hours", desc: "Uninterrupted time" },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                className="bg-slate-50 rounded-xl p-5 text-center hover:bg-slate-100/80 transition-colors border border-slate-100"
                            >
                                <div className="w-10 h-10 mx-auto mb-3 bg-white rounded-lg flex items-center justify-center text-[#C4122F] text-base shadow-sm border border-slate-100">
                                    {item.icon}
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm mb-0.5">{item.title}</h4>
                                <p className="text-slate-400 text-xs">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== TESTIMONIALS ===== */}
            <section className="py-20 px-6 md:px-10 bg-[#FAFBFC]">
                <div className="max-w-6xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
                        <span className="inline-block px-4 py-1.5 bg-[#C4122F]/8 text-[#C4122F] rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-[#C4122F]/10">
                            Student Reviews
                        </span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
                            What Our Students Say
                        </h2>
                        <p className="text-slate-500 text-base max-w-lg mx-auto">
                            Hear from students who achieved their target band scores with our platform
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {[
                            {
                                name: "Rahima Akter",
                                score: "Band 7.5",
                                quote: "The mock tests felt exactly like the real IELTS exam. The listening section with real audio recordings helped me score Band 8 in listening!",
                                rating: 5,
                                module: "Listening",
                            },
                            {
                                name: "Tanvir Hasan",
                                score: "Band 7.0",
                                quote: "I practiced reading passages here for 2 weeks. The timer and real exam interface made me fully prepared. Highly recommend for IELTS preparation!",
                                rating: 5,
                                module: "Reading",
                            },
                            {
                                name: "Fatema Noor",
                                score: "Band 8.0",
                                quote: "Best IELTS mock test platform in Bangladesh! The writing feedback from examiners was incredibly detailed and helped me improve quickly.",
                                rating: 5,
                                module: "Writing",
                            },
                        ].map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 25 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.12 }}
                                className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300 hover:border-slate-200 relative"
                            >
                                {/* Quote icon */}
                                <FaQuoteLeft className="text-[#C4122F]/10 text-3xl absolute top-5 right-5" />

                                {/* Stars */}
                                <div className="flex items-center gap-0.5 mb-4">
                                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                                        <FaStar key={i} className="text-amber-400 text-sm" />
                                    ))}
                                </div>

                                {/* Quote */}
                                <p className="text-slate-600 text-sm leading-relaxed mb-5">
                                    "{testimonial.quote}"
                                </p>

                                {/* Author */}
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-[#C4122F] to-[#E8354F] rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {testimonial.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-slate-900 font-semibold text-sm">{testimonial.name}</p>
                                            <p className="text-slate-400 text-xs">{testimonial.module} Student</p>
                                        </div>
                                    </div>
                                    <div className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-emerald-100">
                                        {testimonial.score}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== FAQ ===== */}
            <section className="py-20 px-6 md:px-10 bg-white">
                <div className="max-w-3xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
                        <span className="inline-block px-4 py-1.5 bg-[#C4122F]/8 text-[#C4122F] rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-[#C4122F]/10">
                            FAQ
                        </span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-slate-500 text-base max-w-lg mx-auto">
                            Everything you need to know about our IELTS mock test platform
                        </p>
                    </motion.div>

                    <div className="space-y-3">
                        {[
                            {
                                q: "How does the mock test work?",
                                a: "Our mock tests replicate the real IELTS computer-based exam exactly. You'll get Listening (30 min), Reading (60 min), and Writing (60 min) sections with the same question types and timing as the actual exam.",
                            },
                            {
                                q: "How do I get an Exam ID?",
                                a: "You can get an Exam ID by contacting our team or registering on our platform. Once payment is confirmed, you'll receive a unique Exam ID (e.g., BACIELTS240001) to start your mock test.",
                            },
                            {
                                q: "When will I get my results?",
                                a: "Listening and Reading scores are available immediately after completing each module. Writing scores are evaluated by certified examiners and will be available within 24-48 hours.",
                            },
                            {
                                q: "Can I take the test on my phone?",
                                a: "We recommend using a desktop or laptop computer for the best experience, as the real IELTS exam is computer-based. You'll also need headphones for the Listening section.",
                            },
                            {
                                q: "Is the demo exam free?",
                                a: "Yes! The demo exam is completely free and gives you a preview of our platform. However, premium features like detailed results, examiner marking for writing, and score certificates are only available with a real Exam ID.",
                            },
                        ].map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.08 }}
                                className="border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-colors"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 transition-colors ${openFaq === index
                                            ? "bg-[#C4122F] text-white"
                                            : "bg-slate-100 text-slate-500 group-hover:bg-[#C4122F]/10 group-hover:text-[#C4122F]"
                                            }`}>
                                            <FaQuestionCircle />
                                        </div>
                                        <span className="text-slate-800 font-semibold text-sm">{faq.q}</span>
                                    </div>
                                    <div className={`text-slate-400 transition-transform duration-200 ${openFaq === index ? "rotate-180" : ""}`}>
                                        <FaChevronDown className="text-xs" />
                                    </div>
                                </button>
                                {openFaq === index && (
                                    <div className="px-5 pb-4 pt-0">
                                        <div className="pl-11">
                                            <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="py-6 px-6 md:px-10 bg-[#FAFBFC] border-t border-slate-100">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-slate-400 text-xs font-medium">
                    <div className="flex items-center gap-2">
                        <Logo size="small" />
                        <span className="text-slate-200 mx-1">|</span>
                        <p>© {new Date().getFullYear()} Best IELTS BD. All rights reserved.</p>
                    </div>
                    <div className="flex items-center gap-5">
                        <span className="hover:text-[#C4122F] cursor-pointer transition-colors">Privacy</span>
                        <span className="hover:text-[#C4122F] cursor-pointer transition-colors">Terms</span>
                        <span className="hover:text-[#C4122F] cursor-pointer transition-colors">Support</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-400">Developed by <a href="https://extrainweb.com" target="_blank" rel="noopener noreferrer" className="text-[#C4122F] hover:text-[#a50f27] transition-colors font-semibold">ExtraInWeb.com</a></span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
